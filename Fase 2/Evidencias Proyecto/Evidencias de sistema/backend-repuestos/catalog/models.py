from django.db import models
import uuid

# 1. Usuarios
class Usuario(models.Model):
    rut = models.CharField(max_length=12, unique=True)
    nombre_completo = models.CharField(max_length=120)
    email = models.EmailField(max_length=150, unique=True)
    password_hash = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    rol = models.CharField(max_length=20)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self): return self.nombre_completo

# 2. Vehículos (Catálogo base de marcas y modelos)
class Vehiculo(models.Model):
    # Ya no necesitamos patente ni vin aquí
    marca = models.CharField(max_length=50, db_index=True)
    modelo = models.CharField(max_length=80, db_index=True)
    anio_inicio = models.SmallIntegerField(db_index=True, default=2000) # Año en que empezó a fabricarse
    anio_fin = models.SmallIntegerField(blank=True, null=True) # Año en que dejó de fabricarse, si aplica
    motorizacion = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        rango = f"{self.anio_inicio}-{self.anio_fin}" if self.anio_fin else f"{self.anio_inicio}+"
        return f"{self.marca} {self.modelo} {rango}"

# NUEVO: Vehículos específicos de los clientes
class VehiculoCliente(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='vehiculos')
    vehiculo_base = models.ForeignKey(Vehiculo, on_delete=models.RESTRICT)
    patente = models.CharField(max_length=10, unique=True, blank=True, null=True)
    vin = models.CharField(max_length=17, unique=True, blank=True, null=True)
    color = models.CharField(max_length=30, blank=True, null=True)
    
    def __str__(self):
        return f"{self.patente} - {self.vehiculo_base.marca} {self.vehiculo_base.modelo}"

# 3. Categorías y Subcategorías de Repuestos
class Categoria(models.Model):
    nombre = models.CharField(max_length=80)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class Subcategoria(models.Model):
    categoria = models.ForeignKey(Categoria, related_name='subcategorias', on_delete=models.CASCADE)
    nombre = models.CharField(max_length=80)

    def __str__(self):
        return f"{self.categoria.nombre} - {self.nombre}"

# 4. Repuestos (Productos)
class Repuesto(models.Model):
    CONDICION_CHOICES = [
        ('NUEVO', 'Nuevo'),
        ('USADO', 'Usado'),
        ('REACONDICIONADO', 'Reacondicionado'),
    ]

    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    subcategoria = models.ForeignKey(Subcategoria, on_delete=models.SET_NULL, null=True, blank=True)
    sku = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=150)
    marca_fabricante = models.CharField(max_length=80, default='Genérico')
    precio_unitario = models.IntegerField()
    peso_kg = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    stock_disponible = models.IntegerField(default=0)
    stock_reservado = models.IntegerField(default=0)
    condicion = models.CharField(max_length=20, choices=CONDICION_CHOICES, default='NUEVO', db_index=True)
    detalle_desgaste = models.TextField(blank=True, null=True)
    imagen = models.ImageField(upload_to='products/', blank=True, null=True)
    urls_fotos_reales = models.JSONField(blank=True, null=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.sku} - {self.nombre}"

# 5. Compatibilidad Vehicular (Tabla intermedia explícita)
class CompatibilidadVehicular(models.Model):
    repuesto = models.ForeignKey(Repuesto, on_delete=models.CASCADE)
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.CASCADE)
    anio_desde = models.SmallIntegerField()
    anio_hasta = models.SmallIntegerField()
    notas_tecnicas = models.CharField(max_length=255, blank=True, null=True)

# 6. Reglas de Cross-Selling
class ReglaCrossSelling(models.Model):
    repuesto_origen = models.ForeignKey(Repuesto, related_name='sugerencias_origen', on_delete=models.CASCADE)
    repuesto_sugerido = models.ForeignKey(Repuesto, related_name='sugerencias_destino', on_delete=models.CASCADE)
    tipo_relacion = models.CharField(max_length=50)
    prioridad = models.SmallIntegerField(default=1)

# 7. Carrito de Compras
class Carrito(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

# 8. Items del Carrito
class ItemCarrito(models.Model):
    carrito = models.ForeignKey(Carrito, on_delete=models.CASCADE)
    repuesto = models.ForeignKey(Repuesto, on_delete=models.CASCADE)
    cantidad = models.SmallIntegerField()
    precio_capturado = models.IntegerField()

# 9. Tarifas de Despacho
class TarifaDespacho(models.Model):
    region = models.CharField(max_length=80)
    comuna = models.CharField(max_length=80, unique=True)
    costo_base_kg = models.IntegerField()
    dias_habiles_estimados = models.SmallIntegerField()

# 10. Pedidos
class Pedido(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    tarifa = models.ForeignKey(TarifaDespacho, on_delete=models.SET_NULL, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    direccion_calle = models.CharField(max_length=255)
    empresa_courier = models.CharField(max_length=50, blank=True, null=True)
    codigo_seguimiento = models.CharField(max_length=80, blank=True, null=True)
    subtotal = models.IntegerField()
    costo_envio = models.IntegerField()
    monto_total = models.IntegerField()
    estado = models.CharField(max_length=30, db_index=True)

# 11. Detalle del Pedido
class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    repuesto = models.ForeignKey(Repuesto, on_delete=models.PROTECT)
    cantidad = models.SmallIntegerField()
    precio_historico = models.IntegerField()

# 12. Transacciones de Pago (Webpay)
class TransaccionPago(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    token_pasarela = models.CharField(max_length=120, unique=True)
    codigo_autorizacion = models.CharField(max_length=50, blank=True, null=True)
    metodo_pago = models.CharField(max_length=30, blank=True, null=True)
    monto_pagado = models.IntegerField()
    estado_pago = models.CharField(max_length=20)
    fecha_transaccion = models.DateTimeField(auto_now_add=True)

# 13. Documentos Tributarios (Boleta/Factura)
class DocumentoTributario(models.Model):
    pedido = models.OneToOneField(Pedido, on_delete=models.CASCADE)
    tipo_documento = models.CharField(max_length=20)
    folio_sii = models.IntegerField(unique=True, db_index=True)
    rut_receptor = models.CharField(max_length=12)
    monto_neto = models.IntegerField()
    monto_iva = models.IntegerField()
    monto_total = models.IntegerField()
    url_pdf_timbrado = models.CharField(max_length=255, blank=True, null=True)
    fecha_emision = models.DateTimeField(auto_now_add=True)

# 14. Solicitudes Especiales
class SolicitudEspecial(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    vin_vehiculo = models.CharField(max_length=17)
    pieza_requerida = models.CharField(max_length=200)
    nivel_urgencia = models.CharField(max_length=15)
    estado = models.CharField(max_length=20, db_index=True)
    valor_cotizado = models.IntegerField(blank=True, null=True)
    comentario_admin = models.TextField(blank=True, null=True)
    fecha_solicitud = models.DateTimeField(auto_now_add=True)

# 15. Sesiones de Chatbot IA
class SesionChatbot(models.Model):
    id_sesion = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    contexto_vehiculo = models.CharField(max_length=100, blank=True, null=True)

# 16. Mensajes del Chatbot
class MensajeChatbot(models.Model):
    sesion = models.ForeignKey(SesionChatbot, on_delete=models.CASCADE)
    emisor = models.CharField(max_length=15)
    contenido = models.TextField()
    fecha_envio = models.DateTimeField(auto_now_add=True)