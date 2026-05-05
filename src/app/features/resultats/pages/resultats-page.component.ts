import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Resultat, Soutenance } from '../../../core/models/domain.models';
import { ResultatsService } from '../../../core/services/resultats.service';
import { SoutenancesService } from '../../../core/services/soutenances.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-resultats-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-header">
      <h1>Resultats</h1>
      <p>Consultation des resultats de soutenance.</p>
    </section>

    <section class="panel">
      <div class="inline-tools" *ngIf="isAdmin">
        <label>Calculer un resultat
          <select [(ngModel)]="selectedCalculateSoutenanceId" [ngModelOptions]="{standalone: true}">
            <option [ngValue]="0">Selectionner une soutenance complete</option>
            <option *ngFor="let s of calculableSoutenances" [ngValue]="s.id">{{ soutenanceLabel(s.id) }}</option>
          </select>
        </label>
        <button class="btn-primary" type="button" (click)="calculateSelected()" [disabled]="!selectedCalculateSoutenanceId">
          Calculer
        </button>
      </div>

      <div class="actions-row">
        <button class="btn-light" type="button" (click)="load()">Actualiser</button>
      </div>

      <table class="data-table" *ngIf="resultats.length">
        <thead>
          <tr>
            <th>Soutenance</th>
            <th>Etudiant</th>
            <th>Moyenne</th>
            <th>Mention</th>
            <th>Decision</th>
            <th>Validation</th>
            <th>Publication</th>
            <th *ngIf="isAdmin">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let resultat of resultats">
            <td>{{ soutenanceLabel(resultat.soutenanceId) }}</td>
            <td>{{ etudiantLabel(resultat.etudiantId, resultat.soutenanceId) }}</td>
            <td>{{ resultat.moyenneFinale | number:'1.2-2' }}</td>
            <td>{{ resultat.mention || '-' }}</td>
            <td>{{ resultat.decisionFinale || '-' }}</td>
            <td>
              <span class="badge" [class.bg-success]="resultat.valide" [class.bg-secondary]="!resultat.valide">
                {{ resultat.valide ? 'Valide' : 'En attente' }}
              </span>
            </td>
            <td>
              <span class="badge" [class.bg-success]="resultat.publie" [class.bg-secondary]="!resultat.publie">
                {{ resultat.publie ? 'Publie' : 'Non publie' }}
              </span>
            </td>
            <td *ngIf="isAdmin">
              <button class="btn-light" type="button" *ngIf="resultat.id && !resultat.valide" (click)="validate(resultat)">
                Valider
              </button>
              <button class="btn-light" type="button" *ngIf="resultat.id && resultat.valide && !resultat.publie" (click)="publish(resultat)">
                Publier
              </button>
              <button class="btn-light" type="button" *ngIf="resultat.soutenanceId && !resultat.valide && !resultat.publie" (click)="calculate(resultat.soutenanceId)">
                Recalculer
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p class="status ok" *ngIf="!loading && !errorMessage && !resultats.length">
        Aucun resultat disponible pour le moment.
      </p>
      <p class="status ok" *ngIf="successMessage">{{ successMessage }}</p>
      <p class="status err" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>
  `
})
export class ResultatsPageComponent implements OnInit {
  private readonly resultatsService = inject(ResultatsService);
  private readonly soutenancesService = inject(SoutenancesService);
  private readonly authService = inject(AuthService);

  resultats: Resultat[] = [];
  soutenances: Soutenance[] = [];
  selectedCalculateSoutenanceId = 0;
  loading = false;
  errorMessage = '';
  successMessage = '';

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  ngOnInit(): void {
    this.loadSoutenances();
    this.load();
  }

  get calculableSoutenances(): Soutenance[] {
    const resultSoutenanceIds = new Set(this.resultats.map(resultat => resultat.soutenanceId));
    return this.soutenances.filter(soutenance =>
      !!soutenance.id
      && soutenance.notePresident != null
      && soutenance.noteRapporteur != null
      && soutenance.noteExaminateur != null
      && !resultSoutenanceIds.has(soutenance.id)
    );
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';

    const request = this.resultatsRequest();

    request.subscribe({
      next: data => {
        this.resultats = data;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
      this.errorMessage = err?.error?.message || 'Chargement des resultats impossible.';
      }
    });
  }

  validate(resultat: Resultat): void {
    if (!resultat.id) {
      return;
    }
    this.resultatsService.validate(resultat.id).subscribe({
      next: () => {
        this.successMessage = 'Resultat valide.';
        this.load();
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Validation impossible.';
      }
    });
  }

  publish(resultat: Resultat): void {
    if (!resultat.id) {
      return;
    }
    this.resultatsService.publish(resultat.id).subscribe({
      next: () => {
        this.successMessage = 'Resultat publie.';
        this.load();
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Publication impossible.';
      }
    });
  }

  calculateSelected(): void {
    if (!this.selectedCalculateSoutenanceId) {
      return;
    }
    this.calculate(this.selectedCalculateSoutenanceId);
  }

  calculate(soutenanceId: number): void {
    this.resultatsService.calculateBySoutenance(soutenanceId).subscribe({
      next: () => {
        this.successMessage = 'Resultat calcule.';
        this.selectedCalculateSoutenanceId = 0;
        this.load();
      },
      error: err => {
        this.errorMessage = err?.error?.message || 'Calcul impossible.';
      }
    });
  }

  soutenanceLabel(soutenanceId?: number): string {
    const soutenance = this.soutenances.find(item => item.id === soutenanceId);
    return soutenance ? `${soutenance.titre} (#${soutenance.id})` : `${soutenanceId ?? '-'}`;
  }

  etudiantLabel(etudiantId?: number, soutenanceId?: number): string {
    const soutenance = this.soutenances.find(item => item.id === soutenanceId);
    const name = [soutenance?.etudiantPrenom, soutenance?.etudiantNom].filter(Boolean).join(' ');
    return name || `${etudiantId ?? '-'}`;
  }

  private resultatsRequest(): Observable<Resultat[]> {
    const role = this.authService.getCurrentRole();
    if (role === 'ADMIN') {
      return this.resultatsService.findAll();
    }

    if (role === 'ETUDIANT') {
      return this.resultatsService.findMe().pipe(
        map(resultat => [resultat]),
        catchError(() => of([]))
      );
    }

    return this.resultatsService.findPublished();
  }

  private loadSoutenances(): void {
    this.soutenancesService.findAll().pipe(catchError(() => of([]))).subscribe(data => {
      this.soutenances = data;
    });
  }
}
