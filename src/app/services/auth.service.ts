import { Injectable } from '@angular/core';
import { RegisterUser } from '../models/register-user.model';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { LoginUser } from '../models/login-user.model'; 
import { tap } from 'rxjs';
import { UserProfileDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // apiUrl: 'https://localhost:5243/api/user' | undefined;

  private apiUrl = 'https://localhost:5243/api';

  constructor(private http: HttpClient) { }

  register(registerData: RegisterUser): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/register`, registerData);
  }

  login(loginData: LoginUser): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/user/login`, loginData).pipe(
      tap((response: { token: string; }) => {
        // Se a resposta contiver um token, salve-o no Local Storage do navegador
        if (response && response.token) {
          localStorage.setItem('authToken', response.token);
          console.log('Login bem-sucedido, token salvo!');
        }
      })
    );
  }

  getUserProfile(): Observable<UserProfileDto> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<UserProfileDto>(`${this.apiUrl}/user/me`, { headers });
  }

  updateUserProfile(userData: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put(`${this.apiUrl}/user/me`, userData, { headers });
  }

}
