import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { Resultat } from '../../core/models/domain.models';
import { ResultatsService } from '../../core/services/resultats.service';
import { SoutenancesService } from '../../core/services/soutenances.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-header dashboard-hero">
      <div>
        <span class="eyebrow">{{ roleLabel }}</span>
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>
      <div class="hero-meter" aria-hidden="true">
        <span></span>
        <strong>{{ soutenancesCount + resultatsCount }}</strong>
      </div>
    </section>

    <section class="panel">
      <div class="summary-grid">
        <a class="summary-tile" routerLink="/soutenances">
          <strong>{{ soutenancesCount }}</strong>
          <span>Soutenances</span>
        </a>
        <a class="summary-tile" routerLink="/resultats">
          <strong>{{ resultatsCount }}</strong>
          <span>Resultats</span>
        </a>
        <a class="summary-tile" *ngIf="isTeacher" routerLink="/notes">
          <strong>{{ pendingNotes }}</strong>
          <span>Notes a saisir</span>
        </a>
        <a class="summary-tile" *ngIf="isAdmin" routerLink="/etudiants">
          <strong>CRUD</strong>
          <span>Administration</span>
        </a>
      </div>
      <p class="status err" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>
  `,
  styles: [`
    .dashboard-hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      min-height: 180px;
      background:
        linear-gradient(135deg, rgba(255,255,255,.88), rgba(255,255,255,.68)),
        linear-gradient(120deg, rgba(15,118,110,.18), rgba(246,182,66,.16), rgba(227,93,79,.12));
    }
    .eyebrow {
      display: inline-flex;
      margin-bottom: 10px;
      border-radius: 8px;
      background: rgba(15, 118, 110, .1);
      padding: 6px 10px;
      color: #0f766e;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .hero-meter {
      position: relative;
      display: grid;
      height: 120px;
      width: 120px;
      flex: 0 0 auto;
      place-items: center;
      border-radius: 999px;
      background: conic-gradient(from 120deg, #0f766e, #f6b642, #e35d4f, #0f766e);
      box-shadow: 0 20px 50px rgba(15, 118, 110, .22);
      animation: float 6s ease-in-out infinite;
    }
    .hero-meter span {
      position: absolute;
      inset: 10px;
      border-radius: inherit;
      background: rgba(255, 255, 255, .92);
    }
    .hero-meter strong {
      position: relative;
      color: #172033;
      font-size: 32px;
      font-weight: 950;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 16px;
    }
    .summary-tile {
      min-height: 130px;
      overflow: hidden;
    }
    .summary-tile::after {
      content: "";
      display: block;
      height: 4px;
      margin-top: 22px;
      border-radius: 999px;
      background: linear-gradient(90deg, #0f766e, #f6b642, #e35d4f);
    }
    .summary-tile strong {
      display: block;
      font-size: 34px;
      line-height: 1;
      margin-bottom: 8px;
    }
    @media (max-width: 700px) {
      .dashboard-hero {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `]
})
export class DashboardPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly soutenancesService = inject(SoutenancesService);
  private readonly resultatsService = inject(ResultatsService);

  soutenancesCount = 0;
  resultatsCount = 0;
  pendingNotes = 0;
  errorMessage = '';

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  get isTeacher(): boolean {
    return this.authService.hasRole('ENSEIGNANT');
  }

  get title(): string {
    if (this.isAdmin) return 'Tableau de bord admin';
    if (this.isTeacher) return 'Mon espace enseignant';
    return 'Mon espace etudiant';
  }

  get roleLabel(): string {
    if (this.isAdmin) return 'Administration';
    if (this.isTeacher) return 'Enseignant';
    return 'Etudiant';
  }

  get subtitle(): string {
    if (this.isAdmin) return 'Pilotage des soutenances, jurys et resultats.';
    if (this.isTeacher) return 'Vos soutenances assignees et les notes a saisir.';
    return 'Vos soutenances et resultats publies.';
  }

  ngOnInit(): void {
    forkJoin({
      soutenances: this.soutenancesService.findAll().pipe(catchError(() => of([]))),
      resultats: this.resultatsRequest().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ soutenances, resultats }) => {
        this.soutenancesCount = soutenances.length;
        this.resultatsCount = resultats.length;
        this.pendingNotes = this.countPendingNotes(soutenances);
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le tableau de bord.';
      }
    });
  }

  private resultatsRequest(): Observable<Resultat[]> {
    if (this.authService.hasRole('ADMIN')) {
      return this.resultatsService.findAll();
    }
    if (this.authService.hasRole('ETUDIANT')) {
      return this.resultatsService.findMe().pipe(
        map(resultat => [resultat]),
        catchError(() => of([]))
      );
    }
    return this.resultatsService.findPublished();
  }

  private countPendingNotes(soutenances: Array<{ notePresident?: number; noteRapporteur?: number; noteExaminateur?: number; presidentId?: number; rapporteurId?: number; examinateurId?: number }>): number {
    const teacherId = this.authService.getCurrentEnseignantId();
    if (!teacherId) return 0;
    return soutenances.filter(s => {
      if (s.presidentId === teacherId) return s.notePresident == null;
      if (s.rapporteurId === teacherId) return s.noteRapporteur == null;
      if (s.examinateurId === teacherId) return s.noteExaminateur == null;
      return false;
    }).length;
  }
}
