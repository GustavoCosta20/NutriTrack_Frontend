import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
  
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false;

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(8)]],
      dataNascimento: [null, [Validators.required]],
      alturaEmCm: [null, [Validators.required, Validators.min(50), Validators.max(300)]],
      pesoEmKg: [null, [Validators.required, Validators.min(20), Validators.max(500)]],
      genero: [null, [Validators.required]],
      nivelDeAtividade: [null, [Validators.required]],
      objetivo: [null, [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.isLoading) {
      this.registerForm.markAllAsTouched();
      console.log('Formulário inválido ou aguardando resposta');
      return;
    }

    this.errorMessage = null;
    this.isLoading = true; 

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        console.log('Usuário registrado com sucesso!', response);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erro ao registrar:', err);
        this.errorMessage = err.error?.message || 'Ocorreu um erro ao tentar registrar. Por favor, tente novamente.';
        this.isLoading = false;
      }
    });

    console.log('Formulário válido!');
    console.log(this.registerForm.value);
  }
}