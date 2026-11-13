import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { AdminComponent } from './pages/admin/admin';
import { adminGuard } from './guards/admin-guard';


export const routes: Routes = [
  { path: '', component: Home }, // La página principal
  { path: 'nosotros', component: About },
  { path: 'login', component: Login },
  { path: 'registro', component: Register },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' } // Si escriben mal la URL, los manda al inicio
];