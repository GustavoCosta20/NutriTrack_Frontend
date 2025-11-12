import { Injectable } from '@angular/core';
import { RegisterUser } from '../models/register-user.model';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { LoginUser } from '../models/login-user.model'; 
import { tap } from 'rxjs';
import { UserProfileDto } from '../models/user.model';
import { CriarRefeicaoRequest, CriarRefeicaoResponse, RefeicaoDto, RefeicoesDoHojeResponse } from '../models/snack.model';

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

  questionForIA(question: string): Observable<string> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Encode da pergunta para URL
    const params = { pergunta: question };

    return this.http.get<string>(`${this.apiUrl}/ai/connection`, { 
      headers, 
      params,
      responseType: 'text' as 'json'
    });
  }

  criarRefeicao(descricaoRefeicao: string, nomeRefeicao: string = ''): Observable<CriarRefeicaoResponse> {
    const request: CriarRefeicaoRequest = {
      descricaoRefeicao,
      nomeRefeicao
    };

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<CriarRefeicaoResponse>(
      `${this.apiUrl}/refeicao`, 
      request, 
      { headers }
    );
  }

  obterRefeicoesDeHoje(): Observable<RefeicoesDoHojeResponse> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<RefeicoesDoHojeResponse>(
      `${this.apiUrl}/refeicao/hoje`, 
      { headers }
    );
  }

  obterRefeicoes(data?: string): Observable<RefeicaoDto[]> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let url = `${this.apiUrl}/refeicao`;
    if (data) {
      url += `?data=${data}`;
    }

    return this.http.get<RefeicaoDto[]>(url, { headers });
  }

  atualizarRefeicao(refeicaoId: string, descricaoRefeicao: string, nomeRefeicao: string = ''): Observable<CriarRefeicaoResponse> {
    const request: CriarRefeicaoRequest = {
      descricaoRefeicao,
      nomeRefeicao
    };

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put<CriarRefeicaoResponse>(
      `${this.apiUrl}/refeicao/${refeicaoId}`, 
      request, 
      { headers }
    );
  }
}
