import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminCrudService } from '../../services/admin-crud';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  repuestos: any[] = [];
  repuestosFiltrados: any[] = [];
  categorias: any[] = [];
  subcategorias: any[] = [];
  subcategoriasFiltradas: any[] = [];
  vehiculosDisponibles: any[] = [];

  repuestoForm!: FormGroup;
  archivoImagen: File | null = null;
  terminoBusqueda: string = '';
  filtroVehiculo: string = '';
  editandoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private adminCrudService: AdminCrudService
  ) {}

  ngOnInit(): void {
    this.repuestoForm = this.fb.group({
      sku: ['', Validators.required],
      nombre: ['', Validators.required],
      marca_fabricante: ['', Validators.required],
      categoria: ['', Validators.required],
      subcategoria: ['', Validators.required],
      condicion: ['NUEVO', Validators.required],
      peso_kg: [1.0, [Validators.required, Validators.min(0.01)]],
      precio: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      vehiculos: [[]]
    });

    // Filtra subcategorías según la categoría elegida
    this.repuestoForm.get('categoria')?.valueChanges.subscribe((catId) => {
      this.subcategoriasFiltradas = this.subcategorias.filter(
        (sub) => sub.categoria == catId
      );
      const subActual = this.repuestoForm.get('subcategoria')?.value;
      const pertenece = this.subcategoriasFiltradas.some((sub) => sub.id == subActual);
      if (!pertenece) {
        this.repuestoForm.get('subcategoria')?.setValue('');
      }
    });

    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.adminCrudService.getCategorias().subscribe({
      next: (data: any) => (this.categorias = data),
      error: (err: any) => console.error('Error al cargar categorías:', err)
    });

    this.adminCrudService.getSubcategorias().subscribe({
      next: (data: any) => (this.subcategorias = data),
      error: (err: any) => console.error('Error al cargar subcategorías:', err)
    });

    this.adminCrudService.getVehiculos().subscribe({
      next: (data: any) => (this.vehiculosDisponibles = data),
      error: (err: any) => console.error('Error al cargar vehículos:', err)
    });

    this.cargarRepuestos();
  }

  cargarRepuestos(): void {
    this.adminCrudService.getRepuestos().subscribe({
      next: (data: any) => {
        this.repuestos = data;
        this.filtrarRepuestos();
      },
      error: (err: any) => console.error('Error al cargar repuestos:', err)
    });
  }

  filtrarRepuestos(): void {
    const busqueda = this.terminoBusqueda.toLowerCase().trim();
    if (!busqueda) {
      this.repuestosFiltrados = [...this.repuestos];
      return;
    }

    this.repuestosFiltrados = this.repuestos.filter(
      (rep) =>
        (rep.nombre || '').toLowerCase().includes(busqueda) ||
        (rep.sku || '').toLowerCase().includes(busqueda)
    );
  }

  // =========================================================
  // SELECTOR DE VEHÍCULOS CON BUSCADOR Y CHECKMARKS
  // =========================================================

  getEtiquetaVehiculo(v: any): string {
    if (v.nombre && v.nombre.includes('motor')) return v.nombre; // Por si el backend ya lo trae listo
    
    const rango = v.anio_fin ? `${v.anio_inicio}-${v.anio_fin}` : (v.anio_inicio ? `${v.anio_inicio}+` : '');
    const motor = v.motorizacion ? `(Motor ${v.motorizacion})` : '';
    
    return `${v.marca || ''} ${v.modelo || ''} ${rango} ${motor}`.trim();
  }

  get vehiculosFiltrados(): any[] {
    const termino = this.filtroVehiculo.toLowerCase().trim();
    if (!termino) return this.vehiculosDisponibles;

    return this.vehiculosDisponibles.filter((v) =>
      this.getEtiquetaVehiculo(v).toLowerCase().includes(termino)
    );
  }

  get vehiculosSeleccionadosIds(): number[] {
    return this.repuestoForm.get('vehiculos')?.value || [];
  }

  get vehiculosSeleccionadosObj(): any[] {
    const ids = this.vehiculosSeleccionadosIds;
    return this.vehiculosDisponibles.filter((v) => ids.includes(v.id));
  }

  isVehiculoSeleccionado(id: number): boolean {
    return this.vehiculosSeleccionadosIds.includes(id);
  }

  toggleVehiculo(id: number): void {
    const control = this.repuestoForm.get('vehiculos');
    if (!control) return;

    const actuales: number[] = [...(control.value || [])];
    const index = actuales.indexOf(id);

    if (index > -1) {
      actuales.splice(index, 1);
    } else {
      actuales.push(id);
    }

    control.setValue(actuales);
    control.markAsDirty();
  }

  limpiarVehiculos(): void {
    this.repuestoForm.get('vehiculos')?.setValue([]);
  }

  // =========================================================
  // GESTIÓN DE IMAGEN Y CRUD DE REPUESTOS
  // =========================================================

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.archivoImagen = file;
  }

  guardarRepuesto(): void {
    if (this.repuestoForm.invalid) return;

    const formData = new FormData();
    Object.keys(this.repuestoForm.value).forEach((key) => {
      if (key === 'vehiculos') {
        formData.append(key, JSON.stringify(this.repuestoForm.value[key] || []));
      } else {
        formData.append(key, this.repuestoForm.value[key]);
      }
    });

    if (this.archivoImagen) {
      formData.append('imagen', this.archivoImagen, this.archivoImagen.name);
    }

    const peticion$ = this.editandoId
      ? this.adminCrudService.actualizarRepuesto(this.editandoId, formData)
      : this.adminCrudService.crearRepuesto(formData);

    peticion$.subscribe({
      next: () => {
        this.cargarRepuestos();
        this.cancelarEdicion();
      },
      error: (err: any) => console.error('Error al guardar repuesto:', err)
    });
  }

  cargarParaEditar(repuesto: any): void {
    this.editandoId = repuesto.id;
    this.subcategoriasFiltradas = this.subcategorias.filter(
      (sub) => sub.categoria == repuesto.categoria_id
    );

    const vehiculosIds = Array.isArray(repuesto.vehiculos)
      ? repuesto.vehiculos.map((v: any) => (typeof v === 'object' ? v.id : v))
      : [];

    this.repuestoForm.patchValue({
      sku: repuesto.sku,
      nombre: repuesto.nombre,
      marca_fabricante: repuesto.marca_fabricante,
      categoria: repuesto.categoria_id,
      subcategoria: repuesto.subcategoria_id,
      condicion: repuesto.condicion || 'NUEVO',
      peso_kg: repuesto.peso_kg || 1.0,
      precio: repuesto.precio,
      stock: repuesto.stock,
      vehiculos: vehiculosIds
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.archivoImagen = null;
    this.filtroVehiculo = '';
    this.subcategoriasFiltradas = [];
    this.repuestoForm.reset({
      categoria: '',
      subcategoria: '',
      condicion: 'NUEVO',
      peso_kg: 1.0,
      vehiculos: []
    });
  }

  actualizarStockRapido(repuesto: any, variacion: number): void {
    const nuevoStock = repuesto.stock + variacion;
    if (nuevoStock >= 0) {
      this.adminCrudService.actualizarStock(repuesto.id, nuevoStock).subscribe({
        next: () => {
          repuesto.stock = nuevoStock;
        },
        error: (err: any) => console.error('Error al actualizar stock:', err)
      });
    }
  }

  borrarRepuesto(id: number): void {
    if (confirm('¿Estás seguro de eliminar este repuesto del inventario?')) {
      this.adminCrudService.eliminarRepuesto(id).subscribe({
        next: () => this.cargarRepuestos(),
        error: (err: any) => console.error('Error al eliminar repuesto:', err)
      });
    }
  }
}