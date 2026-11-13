import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminCrudService {
  private apiUrl = 'http://localhost:8000/api/';

  constructor(private http: HttpClient) {}

  // Función auxiliar para extraer el token CSRF que envía Django en las cookies
  private getCsrfToken(): string {
    const name = 'csrftoken';
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : '';
  }

  // Método privado para generar los headers con credenciales y CSRF
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-CSRFToken': this.getCsrfToken()
    });
  }

  // Consultas para selectores del formulario (GET no requiere CSRF)
  getCategorias(): Observable<any> {
    return this.http.get(`${this.apiUrl}categorias/`);
  }

  getSubcategorias(): Observable<any> {
    return this.http.get(`${this.apiUrl}subcategorias/`);
  }

  getVehiculos(): Observable<any> {
    return this.http.get(`${this.apiUrl}vehiculos/`);
  }

  // CRUD completo para repuestos
  getRepuestos(): Observable<any> {
    return this.http.get(`${this.apiUrl}repuestos/`);
  }

  crearRepuesto(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}repuestos/`, formData, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    });
  }

  actualizarRepuesto(id: number, formData: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}repuestos/${id}/`, formData, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    });
  }

  actualizarStock(id: number, stock: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}repuestos/${id}/`, { stock }, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    });
  }

  eliminarRepuesto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}repuestos/${id}/`, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    });
  }

  // Método para autenticar al usuario contra la base de datos
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}login/`, credentials, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    });
  }
}