import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { CalculatingComponent } from './pages/calculating/calculating.component'; // 1. Importe aqui
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { HistoryComponent } from './pages/history/history.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'calculating', component: CalculatingComponent }, 
    {
    path: '', // Rota raiz da área logada
    component: MainLayoutComponent,
    children: [ // Rotas "filhas" que serão exibidas dentro do layout
      { path: 'dashboard', component: DashboardComponent },
      { path: 'meu-perfil', component: ProfileComponent },
      { path: 'historico', component: HistoryComponent },
    ]
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }