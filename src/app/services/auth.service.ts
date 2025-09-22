import { Injectable } from '@angular/core';
import { RegisterUser } from '../models/register-user.model';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http'
import { LoginUser } from '../models/login-user.model'; 
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // apiUrl: 'https://localhost:5243/api/user' | undefined;

  constructor(private http: HttpClient) { }

  register(registerData: RegisterUser): Observable<any> {
    return this.http.post(`https://localhost:5243/api/user/register`, registerData);
  }

  login(loginData: LoginUser): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`https://localhost:5243/api/user/login`, loginData).pipe(
      tap((response: { token: string; }) => {
        // Se a resposta contiver um token, salve-o no Local Storage do navegador
        if (response && response.token) {
          localStorage.setItem('authToken', response.token);
          console.log('Login bem-sucedido, token salvo!');
        }
      })
    );
  }
}
