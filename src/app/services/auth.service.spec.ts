import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Objetivo, RegisterUser } from '../models/register-user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const apiUrl = environment.apiUrl;

  // Mock do localStorage
  const mockLocalStorage: any = {
    store: {},
    getItem(key: string) {
      return this.store[key] || null;
    },
    setItem(key: string, value: string) {
      this.store[key] = value;
    },
    clear() {
      this.store = {};
    }
  };

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage.getItem(key));
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => mockLocalStorage.setItem(key, value));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    mockLocalStorage.clear();
  });

  // -----------------------------------------------------------
  // TESTES
  // -----------------------------------------------------------

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  // ---------------- LOGIN ----------------

  it('deve realizar login e salvar token no localStorage', () => {
    const mockToken = 'abc123';

    service.login({ email: 'a@a.com', senha: '123' })
      .subscribe(response => {
        expect(response.token).toBe(mockToken);
      });

    const req = httpMock.expectOne(`${apiUrl}/user/login`);
    expect(req.request.method).toBe('POST');

    req.flush({ token: mockToken });

    expect(localStorage.setItem).toHaveBeenCalledWith('authToken', mockToken);
  });

  // ---------------- REGISTER ----------------

  it('deve registrar usuário', () => {
  const mockReq: RegisterUser = {
    nomeCompleto: 'Usuário Teste',
    email: 'teste@a.com',
    senha: '123456',
    dataNascimento: '1995-05-10',
    alturaEmCm: 175,
    pesoEmKg: 80,
    genero: 1,              // ou Genero.Masculino caso seja enum
    nivelDeAtividade: 2,    // idem
    objetivo: 3             // idem
  };

  service.register(mockReq).subscribe();

  const req = httpMock.expectOne(`${apiUrl}/user/register`);
  expect(req.request.method).toBe('POST');
  expect(req.request.body).toEqual(mockReq);

  req.flush({});
  });

  // ---------------- GET PROFILE ----------------

  it('deve buscar perfil do usuário com Authorization header', () => {
    mockLocalStorage.setItem('authToken', 'XYZ');

    service.getUserProfile().subscribe();

    const req = httpMock.expectOne(`${apiUrl}/user/me`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer XYZ');

    req.flush({});
  });

  // ---------------- UPDATE PROFILE ----------------

  it('deve atualizar perfil enviando application/json + bearer token', () => {
    mockLocalStorage.setItem('authToken', '123');

    const data = { nome: 'Novo Nome' };

    service.updateUserProfile(data).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/user/me`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Authorization')).toBe('Bearer 123');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.body).toEqual(data);

    req.flush({});
  });

  // ---------------- QUESTION IA ----------------

  it('deve fazer pergunta para IA', () => {
    mockLocalStorage.setItem('authToken', 'aaa');

    service.questionForIA('oi IA').subscribe();

    const req = httpMock.expectOne(r => r.url === `${apiUrl}/ai/connection`);
    
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('pergunta')).toBe('oi IA');

    req.flush('resposta');
  });

  // ---------------- CRIAR REFEICAO ----------------

  it('deve criar refeição', () => {
    mockLocalStorage.setItem('authToken', 'token123');

    const reqData = { descricaoRefeicao: 'Banana', nomeRefeicao: '' };

    service.criarRefeicao('Banana').subscribe();

    const req = httpMock.expectOne(`${apiUrl}/refeicao`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token123');
    expect(req.request.body).toEqual(reqData);

    req.flush({});
  });

  // ---------------- REFEIÇÕES HOJE ----------------

  it('deve obter refeições de hoje', () => {
    mockLocalStorage.setItem('authToken', 'xxx');

    service.obterRefeicoesDeHoje().subscribe();

    const req = httpMock.expectOne(`${apiUrl}/refeicao/hoje`);
    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  // ---------------- OBTER REFEIÇÕES (COM E SEM DATA) ----------------

  it('deve obter refeições sem data', () => {
    service.obterRefeicoes().subscribe();

    const req = httpMock.expectOne(`${apiUrl}/refeicao`);
    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  it('deve obter refeições com data', () => {
    service.obterRefeicoes('2025-01-01').subscribe();

    const req = httpMock.expectOne(`${apiUrl}/refeicao?data=2025-01-01`);
    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  // ---------------- ATUALIZAR REFEIÇÃO ----------------

  it('deve atualizar refeição', () => {
    mockLocalStorage.setItem('authToken', 'zzz');

    const id = '10';
    const body = { descricaoRefeicao: 'Arroz', nomeRefeicao: '' };

    service.atualizarRefeicao(id, 'Arroz').subscribe();

    const req = httpMock.expectOne(`${apiUrl}/refeicao/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);

    req.flush({});
  });

  // ---------------- ATUALIZAR NOME REFEIÇÃO ----------------

  it('deve atualizar nome da refeição', () => {
    const id = '55';

    service.atualizarNomeRefeicao(id, 'Almoço').subscribe();

    const req = httpMock.expectOne(`${apiUrl}/refeicao/${id}/nome`);
    expect(req.request.method).toBe('PATCH');

    expect(req.request.body).toEqual({ nomeRefeicao: 'Almoço' });

    req.flush({});
  });

  // ---------------- EXCLUIR REFEIÇÃO ----------------

  it('deve excluir refeição', () => {
    const id = '99';

    service.excluirRefeicao(id).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/refeicao/${id}`);
    expect(req.request.method).toBe('DELETE');

    req.flush({});
  });

  // ---------------- CHAT IA ----------------

  it('deve conversar com IA', () => {
    const mensagem = 'oi';
    mockLocalStorage.setItem('authToken', 'abc');

    service.conversarComIA(mensagem).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/ChatIa/conversar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');

    expect(req.request.body).toEqual({ mensagem });

    req.flush({});
  });
});
