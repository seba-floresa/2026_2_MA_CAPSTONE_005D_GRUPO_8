import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html', 
})
export class Home implements OnInit {
  products: any[] = [];
  
  searchMake: string = '';
  searchModel: string = '';
  searchYear: string = '';

  constructor(private api: ApiService) {}

  ngOnInit() { 
    this.loadProducts(); 
  }

  loadProducts() {
    this.api.getProducts(this.searchMake, this.searchModel, this.searchYear)
      .subscribe((data: any) => { 
        this.products = data; 
      });
  }

  onSearch() { 
    this.loadProducts(); 
  }

  clearSearch() {
    this.searchMake = ''; 
    this.searchModel = ''; 
    this.searchYear = '';
    this.loadProducts();
  }
}