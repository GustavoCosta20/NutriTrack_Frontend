import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calculating',
  templateUrl: './calculating.component.html',
  styleUrls: ['./calculating.component.scss']
})
  
export class CalculatingComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Inicia um timer de 4 segundos
    setTimeout(() => {
      // navega para a página de dashboard.
      // criar o componente e a rota para '/dashboard' depois.
      this.router.navigate(['/dashboard']);
    }, 4000);
  }
}
