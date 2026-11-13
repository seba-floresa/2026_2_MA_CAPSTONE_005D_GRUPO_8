import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { RouterModule } from '@angular/router';

// 1. Validador de RUT (Módulo 11)
export const rutValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  let value = control.value;
  if (!value) return null;
  
  // Limpiamos puntos y guiones para calcular
  value = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (value.length < 8) return { invalidRut: true };

  const cuerpo = value.slice(0, -1);
  const dv = value.slice(-1);
  let suma = 0;
  let multiplicador = 2;

  // Algoritmo: Invertir, multiplicar (2 al 7) y sumar
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  // Calcular módulo 11 y restar a 11
  const resto = suma % 11;
  const dvCalculado = 11 - resto;
  
  // Reglas especiales
  let dvEsperado = dvCalculado.toString();
  if (dvCalculado === 11) dvEsperado = '0';
  if (dvCalculado === 10) dvEsperado = 'K';

  return dvEsperado === dv ? null : { invalidRut: true };
};

// 2. Validador de Contraseñas
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const repeatPassword = control.get('confirmPassword');
  if (password && repeatPassword && password.value !== repeatPassword.value) {
    return { passwordsMismatch: true };
  }
  return null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
})
export class Register implements OnInit {
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      rut: ['', [Validators.required, rutValidator]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]], // Solo 9 dígitos
      // Expresión regular estricta para correo (exige un . y al menos 2 letras al final)
      correo: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  // Bloquea letras en el RUT y formatea si es válido
  onRutInput(event: any): void {
    // Reemplaza todo lo que NO sea número o k/K
    let cleanValue = event.target.value.replace(/[^0-9kK]/g, '').toUpperCase();
    
    // Si el RUT pasa el validador, lo formateamos con puntos y guion
    const control = this.registerForm.get('rut');
    control?.setValue(cleanValue, { emitEvent: false }); // Seteamos el valor limpio temporalmente para validar
    
    if (control?.valid && cleanValue.length > 7) {
      const cuerpo = cleanValue.slice(0, -1);
      const dv = cleanValue.slice(-1);
      // Formato chileno: XX.XXX.XXX-X
      const rutFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
      control?.setValue(rutFormateado, { emitEvent: false });
    }
  }

  // Bloquea cualquier letra en el teléfono
  onPhoneInput(event: any): void {
    const cleanValue = event.target.value.replace(/[^0-9]/g, '');
    this.registerForm.get('telefono')?.setValue(cleanValue, { emitEvent: false });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValues = this.registerForm.value;
    const payloadDjango = {
      rut: formValues.rut,
      nombre_completo: `${formValues.nombre} ${formValues.apellidos}`.trim(),
      email: formValues.correo,
      password: formValues.password,
      // Concatenamos el +56 que el usuario no escribió
      telefono: `+56${formValues.telefono}`,
      rol: 'CLIENTE'
    };

    console.log('Datos listos para Django:', payloadDjango);
    alert('¡Formulario válido y listo para enviar!');
  }
}