import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { SoutenanceService } from '../soutenance.service';
import { Note, Resultat, Soutenance } from '../../../core/models/domain.models';
import { AuthService } from '../../../core/auth/auth.service';
import { NotesService } from '../../../core/services/notes.service';
import { ResultatsService } from '../../../core/services/resultats.service';

@Component({
  selector: 'app-soutenance-list',
  templateUrl: './soutenance-list.component.html',
  styleUrls: ['./soutenance-list.component.css']
})
export class SoutenanceListComponent implements OnInit {

  soutenances: Soutenance[] = [];
  loading = false;
  selected?: Soutenance;
  selectedNotes: Note[] = [];
  selectedResultat?: Resultat;
  detailsLoading = false;

  constructor(
    private service: SoutenanceService,
    private router: Router,
    private authService: AuthService,
    private notesService: NotesService,
    private resultatsService: ResultatsService
  ) {}

  ngOnInit(): void {
    this.service.loadAll().subscribe();
    this.service.getSoutenances().subscribe(data => this.soutenances = data);
    this.service.getLoading().subscribe(l => this.loading = l);
  }

  add() { this.router.navigate(['/soutenances/add']); }
  edit(id?: number) { if (id) this.router.navigate(['/soutenances/edit', id]); }
  delete(id?: number) { if (id) this.service.delete(id).subscribe(); }
  canEdit(soutenance: Soutenance): boolean { return this.isAdmin && soutenance.statut !== 'TERMINEE'; }

  viewDetails(soutenance: Soutenance): void {
    if (!soutenance.id) {
      return;
    }

    if (this.selected?.id === soutenance.id) {
      this.closeDetails();
      return;
    }

    this.selected = soutenance;
    this.selectedNotes = [];
    this.selectedResultat = undefined;
    this.detailsLoading = true;

    forkJoin({
      notes: this.notesService.findBySoutenance(soutenance.id).pipe(catchError(() => of([]))),
      resultat: this.resultatsService.findBySoutenance(soutenance.id).pipe(catchError(() => of(undefined)))
    }).pipe(
      finalize(() => this.detailsLoading = false)
    ).subscribe(({ notes, resultat }) => {
      this.selectedNotes = notes;
      this.selectedResultat = resultat;
    });
  }

  closeDetails(): void {
    this.selected = undefined;
    this.selectedNotes = [];
    this.selectedResultat = undefined;
    this.detailsLoading = false;
  }

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  juryLabel(role: 'PRESIDENT' | 'RAPPORTEUR' | 'EXAMINATEUR', soutenance = this.selected): string {
    if (!soutenance) {
      return '-';
    }
    const idByRole = {
      PRESIDENT: soutenance.presidentId,
      RAPPORTEUR: soutenance.rapporteurId,
      EXAMINATEUR: soutenance.examinateurId
    };
    const note = this.selectedNotes.find(item => item.roleJury === role);
    return note?.evaluateurNom || (idByRole[role] ? `Enseignant #${idByRole[role]}` : '-');
  }

  statusClass(status?: string): string {
    if (status === 'TERMINEE') return 'bg-success';
    if (status === 'ANNULEE') return 'bg-danger';
    if (status === 'EN_COURS') return 'bg-info';
    return 'bg-secondary';
  }
}
