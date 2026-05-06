import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Encadrant, Jury, Soutenance } from '../../../core/models/domain.models';
import { EncadrantsService } from '../../../core/services/encadrants.service';
import { JuryService } from '../../../core/services/jury.service';
import { SoutenancesService } from '../../../core/services/soutenances.service';

@Component({
  selector: 'app-jurys-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-header">
      <h1>Jurys</h1>
      <p>Correction du jury uniquement pour les soutenances non terminees.</p>
    </section>

    <section class="panel">
      <h2>Affecter un jury</h2>
      <form (ngSubmit)="save()" class="form-grid">
        <label>Soutenance
          <select name="soutenanceId" [(ngModel)]="form.soutenanceId" required>
            <option [ngValue]="0" disabled>Selectionner</option>
            <option *ngFor="let s of editableSoutenances" [ngValue]="s.id">{{ s.titre }} - {{ s.etudiantNom }} {{ s.etudiantPrenom }}</option>
          </select>
        </label>

        <label>President
          <select name="presidentId" [(ngModel)]="form.presidentId" required>
            <option [ngValue]="0" disabled>Selectionner</option>
            <option *ngFor="let e of encadrants" [ngValue]="e.id">{{ e.nom }} {{ e.prenom }}</option>
          </select>
        </label>

        <label>Rapporteur
          <select name="rapporteurId" [(ngModel)]="form.rapporteurId" required>
            <option [ngValue]="0" disabled>Selectionner</option>
            <option *ngFor="let e of encadrants" [ngValue]="e.id">{{ e.nom }} {{ e.prenom }}</option>
          </select>
        </label>

        <label>Examinateur
          <select name="examinateurId" [(ngModel)]="form.examinateurId" required>
            <option [ngValue]="0" disabled>Selectionner</option>
            <option *ngFor="let e of encadrants" [ngValue]="e.id">{{ e.nom }} {{ e.prenom }}</option>
          </select>
        </label>

        <div class="actions-row">
          <button type="submit" class="btn-primary" [disabled]="!canSubmitJury">Affecter</button>
          <button type="button" class="btn-light" (click)="resetForm()">Reinitialiser</button>
        </div>
      </form>

      <div class="inline-tools">
        <label>Consulter jury d'une soutenance
          <select [(ngModel)]="lookupSoutenanceId" [ngModelOptions]="{standalone: true}">
            <option [ngValue]="0">Selectionner</option>
            <option *ngFor="let s of soutenances" [ngValue]="s.id">{{ s.titre }}</option>
          </select>
        </label>
        <button class="btn-light" (click)="loadJury()">Charger</button>
        <button class="btn-danger" [disabled]="isLookupFinished" (click)="removeJury()">Supprimer jury</button>
      </div>

      <div *ngIf="jury" class="result-card">
        <h3>Jury courant</h3>
        <p><strong>President:</strong> {{ jury.presidentNom || jury.presidentId }}</p>
        <p><strong>Rapporteur:</strong> {{ jury.rapporteurNom || jury.rapporteurId }}</p>
        <p><strong>Examinateur:</strong> {{ jury.examinateurNom || jury.examinateurId }}</p>
      </div>

      <p class="status ok" *ngIf="successMessage">{{ successMessage }}</p>
      <p class="status err" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>
  `
})
export class JurysPageComponent implements OnInit {
  private readonly juryService = inject(JuryService);
  private readonly soutenancesService = inject(SoutenancesService);
  private readonly encadrantsService = inject(EncadrantsService);

  soutenances: Soutenance[] = [];
  encadrants: Encadrant[] = [];
  jury: Jury | null = null;

  lookupSoutenanceId = 0;
  successMessage = '';
  errorMessage = '';

  form: Jury = {
    soutenanceId: 0,
    presidentId: 0,
    rapporteurId: 0,
    examinateurId: 0
  };

  ngOnInit(): void {
    this.soutenancesService.findAll().subscribe({
      next: data => (this.soutenances = data),
      error: err => this.setError(err)
    });
    this.encadrantsService.findAll().subscribe({
      next: data => (this.encadrants = data),
      error: err => this.setError(err)
    });
  }

  get editableSoutenances(): Soutenance[] {
    return this.soutenances.filter(s => s.statut !== 'TERMINEE');
  }

  get canSubmitJury(): boolean {
    return !!this.form.soutenanceId
      && !this.isFinished(this.form.soutenanceId)
      && !!this.form.presidentId
      && !!this.form.rapporteurId
      && !!this.form.examinateurId
      && new Set([this.form.presidentId, this.form.rapporteurId, this.form.examinateurId]).size === 3;
  }

  get isLookupFinished(): boolean {
    return this.isFinished(this.lookupSoutenanceId);
  }

  save(): void {
    if (!this.form.soutenanceId || !this.form.presidentId || !this.form.rapporteurId || !this.form.examinateurId) {
      this.errorMessage = 'Tous les champs sont obligatoires.';
      return;
    }
    if (this.isFinished(this.form.soutenanceId)) {
      this.errorMessage = 'Le jury d une soutenance terminee ne peut pas etre modifie.';
      return;
    }
    if (new Set([this.form.presidentId, this.form.rapporteurId, this.form.examinateurId]).size !== 3) {
      this.errorMessage = 'Les membres du jury doivent etre differents.';
      return;
    }

    this.clearMessages();
    this.juryService.affecter(this.form).subscribe({
      next: () => {
        this.lookupSoutenanceId = this.form.soutenanceId;
        this.loadJury();
        this.successMessage = 'Jury affecte avec succes.';
      },
      error: err => this.setError(err)
    });
  }

  loadJury(): void {
    if (!this.lookupSoutenanceId) {
      return;
    }
    if (this.isFinished(this.lookupSoutenanceId)) {
      this.errorMessage = 'Le jury d une soutenance terminee ne peut pas etre supprime.';
      return;
    }
    this.clearMessages();
    this.juryService.findBySoutenance(this.lookupSoutenanceId).subscribe({
      next: data => (this.jury = data),
      error: err => this.setError(err)
    });
  }

  removeJury(): void {
    if (!this.lookupSoutenanceId) {
      return;
    }
    if (!confirm('Supprimer ce jury ?')) {
      return;
    }

    this.clearMessages();
    this.juryService.delete(this.lookupSoutenanceId).subscribe({
      next: () => {
        this.jury = null;
        this.successMessage = 'Jury supprime.';
      },
      error: err => this.setError(err)
    });
  }

  resetForm(): void {
    this.form = {
      soutenanceId: 0,
      presidentId: 0,
      rapporteurId: 0,
      examinateurId: 0
    };
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private setError(err: unknown): void {
    const message = (err as { error?: { message?: string } })?.error?.message;
    this.errorMessage = message || 'Une erreur est survenue.';
  }

  private isFinished(soutenanceId: number): boolean {
    return this.soutenances.some(s => s.id === soutenanceId && s.statut === 'TERMINEE');
  }
}
