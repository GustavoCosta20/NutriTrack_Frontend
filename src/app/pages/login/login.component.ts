// ARQUIVO: src/app/pages/login/login.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  errorMessage: string | null = null; // Para exibir erros da API

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // <-- INJETE O SERVIÇO
    private router: Router          // <-- INJETE O ROUTER
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]]
    });
  }

  // ATUALIZE O MÉTODO onSubmit
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        //SUCESSO
        this.router.navigate(['/calculating']);
      },
      error: (err) => {
        // ERRO!
        console.error('Erro no login:', err);
        this.errorMessage = 'E-mail ou senha inválidos. Por favor, tente novamente.';
      }
    });
  }
}