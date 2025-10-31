import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // 1. Importe o Router
import { AuthService } from '../../services/auth.service'; // 2. Importe o AuthService

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
  
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  errorMessage: string | null = null;

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

  // Injetamos o FormBuilder para nos ajudar a criar o formulário
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      // Definimos cada campo do formulário e suas validações
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

  // Método chamado quando o formulário é enviado
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      console.log('Formulário inválido');
      return;
    }

    this.errorMessage = null; // Limpa erros anteriores

    // Chama o método de registro do serviço, passando os valores do formulário
    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        // SUCESSO!
        console.log('Usuário registrado com sucesso!', response);
        // Redireciona o usuário para a página de login após o registro
        this.router.navigate(['/login']);
      },
      error: (err) => {
        // ERRO!
        console.error('Erro ao registrar:', err);
        // Tenta pegar uma mensagem de erro específica da API, senão, usa uma genérica
        this.errorMessage = err.error?.message || 'Ocorreu um erro ao tentar registrar. Por favor, tente novamente.';
      }
    });

    // Se o formulário for válido, aqui você enviará os dados para o seu serviço
    console.log('Formulário válido!');
    console.log(this.registerForm.value);
  }
}