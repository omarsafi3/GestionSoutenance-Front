import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="auth-shell">
      <div class="login-card">
        <h1>Acces refuse</h1>
        <p>Votre role ne permet pas d'ouvrir cette page.</p>
        <a routerLink="/" class="btn-primary">Retour a mon espace</a>
      </div>
    </section>
  `
})
export class UnauthorizedPageComponent {}
