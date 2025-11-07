import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  editMode = false;
  loading = true;
  error: string | null = null;

  // Dados do usuário inicializados vazios
  currentUser = {
    nomeCompleto: '',
    email: '',
    dataNascimento: '',
    alturaEmCm: 0,
    pesoEmKg: 0,
    genero: 0,
    nivelDeAtividade: 0,
    objetivo: 0,
  };

  // Opções para os formulários
  generos = [
    { valor: 1, texto: 'Masculino' }, 
    { valor: 2, texto: 'Feminino' }, 
    { valor: 3, texto: 'Outro' }
  ];
  
  niveisAtividade = [
    { valor: 1, texto: 'Sedentário' }, 
    { valor: 2, texto: 'Atividade Leve' }, 
    { valor: 3, texto: 'Atividade Moderada' }, 
    { valor: 4, texto: 'Atividade Alta' }
  ];
  
  objetivos = [
    { valor: 1, texto: 'Perder Gordura' }, 
    { valor: 2, texto: 'Trocar gordura por massa muscular' }, 
    { valor: 3, texto: 'Ganhar Massa Muscular' }
  ];
 get generoTexto(): string {
    return this.generos.find(g => g.valor === this.currentUser.genero)?.texto || 'Não informado';
  }

  get nivelAtividadeTexto(): string {
    return this.niveisAtividade.find(n => n.valor === this.currentUser.nivelDeAtividade)?.texto || 'Não informado';
  }

  get objetivoTexto(): string {
    return this.objetivos.find(o => o.valor === this.currentUser.objetivo)?.texto || 'Não informado';
  }

  constructor(private fb: FormBuilder,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.initForm();
    this.loadUserProfile();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      nomeCompleto: ['', Validators.required],
      email: [{ value: '', disabled: true }, Validators.required],
      dataNascimento: [null, Validators.required],
      alturaEmCm: [null, Validators.required],
      pesoEmKg: [null, Validators.required],
      genero: [null, Validators.required],
      nivelDeAtividade: [null, Validators.required],
      objetivo: [null, Validators.required]
    });
  }

  private loadUserProfile(): void {
    this.loading = true;
    this.error = null;

    this.authService.getUserProfile().subscribe({
      next: (user) => {
        console.log('Dados recebidos da API:', user);
        
        // Mapeia os dados recebidos do backend
        this.currentUser = {
          nomeCompleto: user.nomeCompleto || '',
          email: user.email || '',
          dataNascimento: user.dataNascimento || '',
          alturaEmCm: user.alturaEmCm || 0,
          pesoEmKg: user.pesoEmKg || 0,
          genero: user.genero || 0,
          nivelDeAtividade: user.nivelDeAtividade || 0,
          objetivo: this.parseObjetivo(user.objetivo)
        };
        
        this.profileForm.patchValue(this.currentUser);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
        
        if (err.status === 401) {
          this.error = 'Sessão expirada. Faça login novamente.';
        } else if (err.status === 404) {
          this.error = 'Perfil não encontrado.';
        } else {
          this.error = 'Erro ao carregar dados do perfil. Tente novamente.';
        }
        
        this.loading = false;
      }
    });
  }

  // Converte a string do objetivo (vinda do backend) em número
  private parseObjetivo(objetivoStr: string): number {
    const objetivoMap: { [key: string]: number } = {
      'PerderGordura': 1,
      'TrocarGorduraPorMassa': 2,
      'GanharMassa': 3,
      'GanharMassaMuscular': 3
    };
    return objetivoMap[objetivoStr] || 0;
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      // Se o usuário cancelar, restaura os valores originais
      this.profileForm.patchValue(this.currentUser);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.error = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    // Prepara os dados para enviar ao backend
    const updatedData = {
      nomeCompleto: this.profileForm.get('nomeCompleto')?.value,
      dataNascimento: this.profileForm.get('dataNascimento')?.value,
      alturaEmCm: Number(this.profileForm.get('alturaEmCm')?.value),
      pesoEmKg: Number(this.profileForm.get('pesoEmKg')?.value),
      genero: Number(this.profileForm.get('genero')?.value),
      nivelDeAtividade: Number(this.profileForm.get('nivelDeAtividade')?.value),
      objetivo: Number(this.profileForm.get('objetivo')?.value)
    };

    this.authService.updateUserProfile(updatedData).subscribe({
      next: (response) => {       
        // Atualiza os dados locais com os novos valores
        this.currentUser = {
          ...this.currentUser,
          nomeCompleto: updatedData.nomeCompleto,
          dataNascimento: updatedData.dataNascimento,
          alturaEmCm: updatedData.alturaEmCm,
          pesoEmKg: updatedData.pesoEmKg,
          genero: updatedData.genero,
          nivelDeAtividade: updatedData.nivelDeAtividade,
          objetivo: updatedData.objetivo
        };

        this.editMode = false;
      },
      error: (err) => {
        console.error('Erro ao atualizar perfil:', err);
      }
    });
  }
}