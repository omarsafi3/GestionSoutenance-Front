import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Encadrant, Note, RoleJury, Soutenance } from '../../../core/models/domain.models';
import { EncadrantsService } from '../../../core/services/encadrants.service';
import { NotesService } from '../../../core/services/notes.service';
import { SoutenancesService } from '../../../core/services/soutenances.service';

@Component({
  selector: 'app-notes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-header">
      <h1>Notes</h1>
      <p>Saisie et mise a jour des notes par membre de jury.</p>
    </section>

    <section class="panel">
      <h2>{{ editingId ? 'Modifier une note' : 'Ajouter une note' }}</h2>
      <form (ngSubmit)="save()" class="form-grid">
        <label>Soutenance
          <select name="soutenanceId" [(ngModel)]="form.soutenanceId" required>
            <option [ngValue]="0" disabled>Selectionner</option>
            <option *ngFor="let s of soutenances" [ngValue]="s.id">{{ s.titre }}</option>
          </select>
        </label>

        <label>Evaluateur
          <select name="evaluateurId" [(ngModel)]="form.evaluateurId" required>
            <option [ngValue]="0" disabled>Selectionner</option>
            <option *ngFor="let e of encadrants" [ngValue]="e.id">{{ e.nom }} {{ e.prenom }}</option>
          </select>
        </label>

        <label>Role jury
          <select name="roleJury" [(ngModel)]="form.roleJury" required>
            <option *ngFor="let role of roles" [ngValue]="role">{{ role }}</option>
          </select>
        </label>

        <label>Note expose<input type="number" name="noteExpose" min="0" max="20" step="0.1" [(ngModel)]="form.noteExpose" required /></label>
        <label>Note rapport<input type="number" name="noteRapport" min="0" max="20" step="0.1" [(ngModel)]="form.noteRapport" required /></label>
        <label>Note questions<input type="number" name="noteQuestions" min="0" max="20" step="0.1" [(ngModel)]="form.noteQuestions" required /></label>
        <label>Commentaire<textarea name="commentaire" [(ngModel)]="form.commentaire"></textarea></label>

        <div class="actions-row">
          <button type="submit" class="btn-primary">{{ editingId ? 'Mettre a jour' : 'Creer' }}</button>
          <button type="button" class="btn-light" (click)="resetForm()">Annuler</button>
        </div>
      </form>

      <div class="inline-tools">
        <label>Filtrer par soutenance
          <select [(ngModel)]="selectedSoutenanceId" [ngModelOptions]="{standalone: true}">
            <option [ngValue]="0">Selectionner</option>
            <option *ngFor="let s of soutenances" [ngValue]="s.id">{{ s.titre }}</option>
          </select>
        </label>
        <button class="btn-light" (click)="loadBySoutenance()">Afficher notes</button>
      </div>

      <table class="data-table" *ngIf="notes.length">
        <thead>
          <tr>
            <th>Evaluateur</th>
            <th>Role</th>
            <th>Expose</th>
            <th>Rapport</th>
            <th>Questions</th>
            <th>Moyenne</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let n of notes">
            <td>{{ n.evaluateurNom || n.evaluateurId }}</td>
            <td>{{ n.roleJury }}</td>
            <td>{{ n.noteExpose }}</td>
            <td>{{ n.noteRapport }}</td>
            <td>{{ n.noteQuestions }}</td>
            <td>{{ n.moyenneEvaluateur || '-' }}</td>
            <td><button class="btn-light" (click)="startEdit(n)">Modifier</button></td>
          </tr>
        </tbody>
      </table>

      <p class="status ok" *ngIf="successMessage">{{ successMessage }}</p>
      <p class="status err" *ngIf="errorMessage">{{ errorMessage }}</p>
    </section>
  `
})
export class NotesPageComponent implements OnInit {
  private readonly notesService = inject(NotesService);
  private readonly soutenancesService = inject(SoutenancesService);
  private readonly encadrantsService = inject(EncadrantsService);

  soutenances: Soutenance[] = [];
  encadrants: Encadrant[] = [];
  notes: Note[] = [];
  selectedSoutenanceId = 0;
  editingId: number | null = null;

  roles: RoleJury[] = ['PRESIDENT', 'RAPPORTEUR', 'EXAMINATEUR'];

  successMessage = '';
  errorMessage = '';

  form: Note = {
    soutenanceId: 0,
    evaluateurId: 0,
    roleJury: 'PRESIDENT',
    noteExpose: 0,
    noteRapport: 0,
    noteQuestions: 0,
    commentaire: ''
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

  save(): void {
    if (!this.form.soutenanceId || !this.form.evaluateurId) {
      this.errorMessage = 'Soutenance et evaluateur sont obligatoires.';
      return;
    }

    this.clearMessages();
    const request = this.editingId
      ? this.notesService.update(this.editingId, this.form)
      : this.notesService.create(this.form);

    request.subscribe({
      next: () => {
        this.successMessage = this.editingId ? 'Note modifiee.' : 'Note enregistree.';
        this.editingId = null;
        this.resetForm();
        if (this.selectedSoutenanceId) {
          this.loadBySoutenance();
        }
      },
      error: err => this.setError(err)
    });
  }

  loadBySoutenance(): void {
    if (!this.selectedSoutenanceId) {
      return;
    }

    this.clearMessages();
    this.notesService.findBySoutenance(this.selectedSoutenanceId).subscribe({
      next: data => (this.notes = data),
      error: err => this.setError(err)
    });
  }

  startEdit(note: Note): void {
    this.editingId = note.id ?? null;
    this.form = {
      id: note.id,
      soutenanceId: note.soutenanceId,
      evaluateurId: note.evaluateurId,
      roleJury: note.roleJury,
      noteExpose: note.noteExpose,
      noteRapport: note.noteRapport,
      noteQuestions: note.noteQuestions,
      commentaire: note.commentaire
    };
  }

  resetForm(): void {
    this.form = {
      soutenanceId: 0,
      evaluateurId: 0,
      roleJury: 'PRESIDENT',
      noteExpose: 0,
      noteRapport: 0,
      noteQuestions: 0,
      commentaire: ''
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
}
