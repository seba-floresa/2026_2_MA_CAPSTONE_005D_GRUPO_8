import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AdminCrudService } from '../../services/admin-crud';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adminCrudService: AdminCrudService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      // Usamos la misma validación estricta del registro
      correo: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      password: ['', [Validators.required]]
    });
  }

 onLogin(): void {
    // Si el formulario es inválido, mostramos los errores y bloqueamos el envío
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Preparamos las credenciales para Django
    const credentials = {
      email: this.loginForm.value.correo,
      password: this.loginForm.value.password
    };

    // Llamamos al servicio para autenticar contra el backend que dio 200 OK
    this.adminCrudService.login(credentials).subscribe({
      next: (response: any) => {
        console.log('¡Respuesta recibida del backend con éxito!', response);
        
        // Guardamos tanto las propiedades individuales como el objeto completo 'user' que espera el guardia
        localStorage.setItem('username', response.username);
        localStorage.setItem('is_staff', response.is_staff ? 'true' : 'false');
        localStorage.setItem('user', JSON.stringify(response));

        if (response.is_staff) {
          console.log('Redirigiendo a /admin...');
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      },
      error: (err) => {
        console.error('Error en el login:', err);
        const mensajeError = err.error?.error || 'Correo o contraseña incorrectos.';
        alert(mensajeError);
      }
    });
  }
}