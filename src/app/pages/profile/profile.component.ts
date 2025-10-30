import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  editMode = false; // Controla se o formulário está em modo de edição

  // Dados do usuário (virão da API no futuro)
  currentUser = {
    nomeCompleto: 'Gustavo Costa',
    email: 'gusta@email.com',
    dataNascimento: '1995-10-20',
    alturaEmCm: 180,
    pesoEmKg: 72,
    genero: 1, // 1: Masculino
    nivelDeAtividade: 3, // 3: Atividade Moderada
    objetivo: 3, // 3: Ganhar Massa
  };

  // Opções para os formulários (reutilizadas do registro)
  generos = [{ valor: 1, texto: 'Masculino' }, { valor: 2, texto: 'Feminino' }, { valor: 3, texto: 'Outro' }];
  niveisAtividade = [{ valor: 1, texto: 'Sedentário' }, { valor: 2, texto: 'Atividade Leve' }, { valor: 3, texto: 'Atividade Moderada' }, { valor: 4, texto: 'Atividade Alta' }];
  objetivos = [{ valor: 1, texto: 'Perder Gordura' }, { valor: 2, texto: 'Trocar gordura por massa muscular' }, { valor: 3, texto: 'Ganhar Massa Muscular' }];

 get generoTexto(): string {
    return this.generos.find(g => g.valor === this.currentUser.genero)?.texto || 'Não informado';
  }

  get nivelAtividadeTexto(): string {
    return this.niveisAtividade.find(n => n.valor === this.currentUser.nivelDeAtividade)?.texto || 'Não informado';
  }

  get objetivoTexto(): string {
    return this.objetivos.find(o => o.valor === this.currentUser.objetivo)?.texto || 'Não informado';
  }

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      nomeCompleto: ['', Validators.required],
      email: [{ value: '', disabled: true }, Validators.required], // E-mail não pode ser editado
      dataNascimento: [null, Validators.required],
      alturaEmCm: [null, Validators.required],
      pesoEmKg: [null, Validators.required],
      genero: [null, Validators.required],
      nivelDeAtividade: [null, Validators.required],
      objetivo: [null, Validators.required]
    });

    // Preenche o formulário com os dados atuais do usuário
    this.profileForm.patchValue(this.currentUser);
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
      return;
    }

    console.log('Dados salvos:', this.profileForm.value);
    // Aqui você chamaria um serviço para enviar os dados para a API

    // Atualiza os dados locais e sai do modo de edição
    this.currentUser = { ...this.currentUser, ...this.profileForm.value };
    this.editMode = false;
  }
}