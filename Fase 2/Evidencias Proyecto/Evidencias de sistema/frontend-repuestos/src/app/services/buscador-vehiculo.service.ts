import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BuscadorVehiculoService {
  // Ajusta el puerto si tu Django corre en otro distinto al 8000
  private apiUrl = 'http://localhost:8000/api/buscar-vehiculo/';

  constructor(private http: HttpClient) {}

  buscar(query: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?q=${query}`);
  }
}