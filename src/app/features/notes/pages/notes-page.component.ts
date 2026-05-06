import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Encadrant, Note, RoleJury, Soutenance } from '../../../core/models/domain.models';
import { EncadrantsService } from '../../../core/services/encadrants.service';
import { NotesService } from '../../../core/services/notes.service';
import { SoutenancesService } from '../../../core/services/soutenances.service';
import { AuthService } from '../../../core/auth/auth.service';

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
          <select name="soutenanceId" [(ngModel)]="form.soutenanceId" (ngModelChange)="onSoutenanceChange()" required>
            <option [ngValue]="0" disabled>Selectionner</option>
            <option *ngFor="let s of soutenances" [ngValue]="s.id">{{ s.titre }}</option>
          </select>
        </label>

        <label *ngIf="isAdmin">Evaluateur
          <select name="evaluateurId" [(ngModel)]="form.evaluateurId" (ngModelChange)="onEvaluatorChange()" required>
            <option [ngValue]="0" disabled>Selectionner</option>
            <option *ngFor="let e of eligibleEvaluateurs" [ngValue]="e.id">{{ e.nom }} {{ e.prenom }}</option>
          </select>
        </label>
        <label *ngIf="!isAdmin">Evaluateur
          <input [value]="'Vous-meme'" disabled />
        </label>

        <label>Role jury
          <input [value]="roleDisplay" disabled />
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
            <td>
              <button class="btn-light" *ngIf="canEditNote(n)" (click)="startEdit(n)">Modifier</button>
            </td>
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
  private readonly authService = inject(AuthService);

  soutenances: Soutenance[] = [];
  encadrants: Encadrant[] = [];
  notes: Note[] = [];
  selectedSoutenanceId = 0;
  editingId: number | null = null;

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

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  get currentEnseignantId(): number | null {
    return this.authService.getCurrentEnseignantId();
  }

  get selectedSoutenanceValue(): Soutenance | undefined {
    return this.soutenances.find(s => s.id === this.form.soutenanceId);
  }

  get eligibleEvaluateurs(): Encadrant[] {
    const soutenance = this.selectedSoutenanceValue;
    if (!soutenance) {
      return this.encadrants;
    }
    const ids = new Set([soutenance.presidentId, soutenance.rapporteurId, soutenance.examinateurId].filter(Boolean));
    return this.encadrants.filter(e => e.id != null && ids.has(e.id));
  }

  get roleDisplay(): string {
    if (!this.form.soutenanceId) return 'Selectionner une soutenance';
    if (!this.form.evaluateurId) return 'Selectionner un evaluateur';
    return this.roleForEvaluator(this.selectedSoutenanceValue, this.form.evaluateurId) || 'Evaluateur hors jury';
  }

  ngOnInit(): void {
    this.soutenancesService.findAll().subscribe({
      next: data => {
        this.soutenances = data;
        if (!this.isAdmin) {
          this.form.evaluateurId = this.currentEnseignantId ?? 0;
        }
      },
      error: err => this.setError(err)
    });
    if (this.isAdmin) {
      this.encadrantsService.findAll().subscribe({
        next: data => (this.encadrants = data),
        error: err => this.setError(err)
      });
    }
  }

  save(): void {
    if (!this.form.soutenanceId || !this.form.evaluateurId) {
      this.errorMessage = 'Soutenance et evaluateur sont obligatoires.';
      return;
    }

    const role = this.roleForEvaluator(this.selectedSoutenanceValue, this.form.evaluateurId);
    if (!role) {
      this.errorMessage = "L'evaluateur selectionne n'est pas membre du jury de cette soutenance.";
      return;
    }
    this.form.roleJury = role;

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
      next: data => (this.notes = this.isAdmin ? data : data.filter(note => note.evaluateurId === this.currentEnseignantId)),
      error: err => this.setError(err)
    });
  }

  startEdit(note: Note): void {
    if (!this.canEditNote(note)) {
      return;
    }
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
      evaluateurId: this.isAdmin ? 0 : this.currentEnseignantId ?? 0,
      roleJury: 'PRESIDENT',
      noteExpose: 0,
      noteRapport: 0,
      noteQuestions: 0,
      commentaire: ''
    };
  }

  onSoutenanceChange(): void {
    if (!this.isAdmin) {
      this.form.evaluateurId = this.currentEnseignantId ?? 0;
    }
    if (this.isAdmin && !this.eligibleEvaluateurs.some(e => e.id === this.form.evaluateurId)) {
      this.form.evaluateurId = 0;
    }
    this.refreshRoleFromSelection();
  }

  onEvaluatorChange(): void {
    this.refreshRoleFromSelection();
  }

  canEditNote(note: Note): boolean {
    return this.isAdmin || note.evaluateurId === this.currentEnseignantId;
  }

  private roleForEvaluator(soutenance: Soutenance | undefined, enseignantId: number | null | undefined): RoleJury | null {
    if (!soutenance || !enseignantId) {
      return null;
    }
    if (soutenance.presidentId === enseignantId) return 'PRESIDENT';
    if (soutenance.rapporteurId === enseignantId) return 'RAPPORTEUR';
    if (soutenance.examinateurId === enseignantId) return 'EXAMINATEUR';
    return null;
  }

  private refreshRoleFromSelection(): void {
    this.form.roleJury = this.roleForEvaluator(this.selectedSoutenanceValue, this.form.evaluateurId) ?? this.form.roleJury;
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
