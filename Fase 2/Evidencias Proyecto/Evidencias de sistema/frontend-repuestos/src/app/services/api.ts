import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // La dirección de tu API en Django
  private baseUrl = 'http://127.0.0.1:8000/api/products/';

  constructor(private http: HttpClient) { }

  // Esta función pide los repuestos y le pasa los filtros si es que hay
  getProducts(make?: string, model?: string, year?: string) {
    let params = new HttpParams();
    if (make) params = params.append('make', make);
    if (model) params = params.append('model', model);
    if (year) params = params.append('year', year);

    return this.http.get<any[]>(this.baseUrl, { params });
  }
}