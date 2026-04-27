import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="auth-shell">
      <form class="auth-panel" (ngSubmit)="login()">
        <h1>Connexion</h1>
        <label>Nom utilisateur
          <input name="username" [(ngModel)]="username" required autocomplete="username">
        </label>
        <label>Mot de passe
          <input name="password" [(ngModel)]="password" required type="password" autocomplete="current-password">
        </label>
        <button class="btn-primary" type="submit" [disabled]="loading">Se connecter</button>
        <p class="status err" *ngIf="errorMessage">{{ errorMessage }}</p>
      </form>
    </section>
  `,
  styles: [`
    .auth-shell { min-height: 60vh; display: grid; place-items: center; }
    .auth-panel { width: min(420px, 92vw); display: grid; gap: 1rem; padding: 2rem; background: #fff; border: 1px solid #dee2e6; border-radius: .5rem; }
    .auth-panel label { display: grid; gap: .35rem; font-weight: 600; }
    .auth-panel input { padding: .65rem .75rem; border: 1px solid #ced4da; border-radius: .375rem; }
  `]
})
export class LoginPageComponent {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  login(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/etudiants']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Connexion impossible';
      }
    });
  }
}
