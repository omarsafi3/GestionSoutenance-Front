import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EnseignantService } from '../enseignant.service';
import { Enseignant } from '../enseignant.model';

@Component({
  selector: 'app-enseignant-list',
  templateUrl: './enseignant-list.component.html',
  styleUrl: './enseignant-list.component.css'
})
export class EnseignantListComponent implements OnInit {

  enseignants: Enseignant[] = [];
  loading = false;

  constructor(
    private service: EnseignantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.loadAll().subscribe();
    this.service.getEnseignants().subscribe(data => {
      this.enseignants = data;
    });

    this.service.getLoading().subscribe(l => this.loading = l);
  }

  deleteConfirmMessage = '';
  selectedDeleteId: number | null = null;
  errorMessage = '';

  delete(id?: number): void {
    if (!id) return;
    this.selectedDeleteId = id;
    this.deleteConfirmMessage = 'Confirmer la suppression de cet enseignant ?';
  }

  confirmDelete(): void {
    if (!this.selectedDeleteId) return;

    this.service.delete(this.selectedDeleteId).subscribe({
      next: () => {
        this.enseignants = this.enseignants.filter(e => e.id !== this.selectedDeleteId);
        this.selectedDeleteId = null;
        this.deleteConfirmMessage = '';
      },
      error: (err) => {
        const message = this.extractDeleteErrorMessage(err);
        this.errorMessage = message;
        this.selectedDeleteId = null;
        this.deleteConfirmMessage = '';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  cancelDelete(): void {
    this.selectedDeleteId = null;
    this.deleteConfirmMessage = '';
  }

  private extractDeleteErrorMessage(err: any): string {
    const errorMsg = err?.error?.message || err?.message || '';
    
    if (errorMsg.toLowerCase().includes('foreign key') || errorMsg.toLowerCase().includes('constraint')) {
      return 'Cet enseignant a des soutenances assignees, impossible a supprimer';
    }
    
    return 'Erreur lors de la suppression';
  }

  edit(id?: number): void {
    if (!id) return;
    this.router.navigate(['/enseignants/edit', id]);
  }

  add(): void {
    this.router.navigate(['/enseignants/add']);
  }
}