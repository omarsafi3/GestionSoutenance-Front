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
        <div class="auth-brand">
          <span>GS</span>
          <div>
            <h1>Connexion</h1>
            <p>Gestion des soutenances</p>
          </div>
        </div>
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
    .auth-shell {
      min-height: 68vh;
      display: grid;
      place-items: center;
      padding: 24px 0;
    }
    .auth-panel {
      position: relative;
      width: min(460px, 94vw);
      display: grid;
      gap: 1rem;
      overflow: hidden;
      padding: 2rem;
      border: 1px solid rgba(255,255,255,.72);
      border-radius: 14px;
      background: rgba(255,255,255,.86);
      box-shadow: 0 26px 70px rgba(23,32,51,.16);
      backdrop-filter: blur(18px);
    }
    .auth-panel::before {
      content: "";
      position: absolute;
      inset: 0 0 auto;
      height: 5px;
      background: linear-gradient(90deg, #0f766e, #f6b642, #e35d4f);
    }
    .auth-brand {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 8px;
    }
    .auth-brand span {
      display: grid;
      width: 52px;
      height: 52px;
      place-items: center;
      border-radius: 14px;
      background: linear-gradient(135deg, #0f766e, #e35d4f);
      color: #fff;
      font-weight: 950;
      box-shadow: 0 18px 38px rgba(15,118,110,.22);
    }
    .auth-brand h1 {
      margin: 0;
      font-size: 30px;
    }
    .auth-brand p {
      margin: 2px 0 0;
      color: #64748b;
      font-size: 13px;
      font-weight: 800;
    }
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
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Connexion impossible';
      }
    });
  }
}
