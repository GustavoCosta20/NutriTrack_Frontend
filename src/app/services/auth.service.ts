import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { RegisterUser } from '../models/register-user.model';
import { LoginUser } from '../models/login-user.model';
import { UserProfileDto } from '../models/user.model';
import { 
  CriarRefeicaoRequest, 
  CriarRefeicaoResponse, 
  RefeicaoDto, 
  RefeicoesDoHojeResponse 
} from '../models/snack.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(registerData: RegisterUser): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/register`, registerData);
  }

  login(loginData: LoginUser): Observable<{ token: string }> {
    console.log('API => ', this.apiUrl)
    return this.http.post<{ token: string }>(`${this.apiUrl}/user/login`, loginData).pipe(
      tap(response => {
        if (response?.token) {
          localStorage.setItem('authToken', response.token);
          console.log('✅ Login bem-sucedido, token salvo no localStorage!');
        }
      })
    );
  }

  getUserProfile(): Observable<UserProfileDto> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserProfileDto>(`${this.apiUrl}/user/me`, { headers });
  }

  updateUserProfile(userData: any): Observable<any> {
    const headers = this.getAuthHeaders(true);
    return this.http.put(`${this.apiUrl}/user/me`, userData, { headers });
  }

  questionForIA(question: string): Observable<string> {
    const headers = this.getAuthHeaders();
    const params = { pergunta: question };

    return this.http.get<string>(`${this.apiUrl}/ai/connection`, {
      headers,
      params,
      responseType: 'text' as 'json'
    });
  }

  criarRefeicao(descricaoRefeicao: string, nomeRefeicao: string = ''): Observable<CriarRefeicaoResponse> {
    const headers = this.getAuthHeaders(true);
    const request: CriarRefeicaoRequest = { descricaoRefeicao, nomeRefeicao };
    
    console.log('📤 Enviando requisição para criar refeição:', request);
    
    return this.http.post<CriarRefeicaoResponse>(`${this.apiUrl}/refeicao`, request, { headers }).pipe(
      tap(response => console.log('📥 Resposta da criação:', response))
    );
  }

  obterRefeicoesDeHoje(): Observable<RefeicoesDoHojeResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<RefeicoesDoHojeResponse>(`${this.apiUrl}/refeicao/hoje`, { headers });
  }

  obterRefeicoes(data?: string): Observable<RefeicaoDto[]> {
    const headers = this.getAuthHeaders();
    let url = `${this.apiUrl}/refeicao`;
    if (data) url += `?data=${data}`;
    return this.http.get<RefeicaoDto[]>(url, { headers });
  }

  atualizarRefeicao(refeicaoId: string, descricaoRefeicao: string, nomeRefeicao: string = ''): Observable<CriarRefeicaoResponse> {
    const headers = this.getAuthHeaders(true);
    const request: CriarRefeicaoRequest = { descricaoRefeicao, nomeRefeicao };
    
    console.log('📤 Enviando requisição para atualizar refeição:');
    console.log('   - ID:', refeicaoId);
    console.log('   - Request:', request);
    console.log('   - URL:', `${this.apiUrl}/refeicao/${refeicaoId}`);
    
    return this.http.put<CriarRefeicaoResponse>(`${this.apiUrl}/refeicao/${refeicaoId}`, request, { headers }).pipe(
      tap(
        response => {
          console.log('📥 Resposta da atualização (sucesso):', response);
        },
        error => {
          console.error('❌ Erro na atualização:', error);
          console.error('   - Status:', error.status);
          console.error('   - Body:', error.error);
        }
      )
    );
  }

  atualizarNomeRefeicao(refeicaoId: string, nomeRefeicao: string): Observable<CriarRefeicaoResponse> {
    const headers = this.getAuthHeaders(true);
    const request = { nomeRefeicao };
    return this.http.patch<CriarRefeicaoResponse>(
      `${this.apiUrl}/refeicao/${refeicaoId}/nome`, 
      request, 
      { headers }
    );
  }

  excluirRefeicao(refeicaoId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/refeicao/${refeicaoId}`, { headers });
  }

  private getAuthHeaders(json = false): HttpHeaders {
    const token = localStorage.getItem('authToken');
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`
    });
    if (json) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return headers;
  }

  conversarComIA(mensagem: string): Observable<any> {
    const headers = this.getAuthHeaders(true);
    return this.http.post(`${this.apiUrl}/ChatIa/conversar`, { mensagem }, { headers });
  }
}