import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { EtudiantService } from '../../services/etudiant.service';
import { Etudiant } from '../../models/etudiant';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-etudiants-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, OnDestroy {
  allEtudiants: Etudiant[] = [];
  filteredEtudiants: Etudiant[] = [];

  loading = false;
  successMessage = '';
  errorMessage = '';

  pageSize = 5;
  currentPage = 1;
  totalPages = 1;

  searchTerm = '';
  filterNiveau = '';
  filterFiliere = '';

  niveauxUniques: string[] = [];
  filiereUniques: string[] = [];

  selectedIdToDelete: number | null = null;
  showDeleteConfirm = false;

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private service: EtudiantService,
    private router: Router
  ) {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(term => {
        this.searchTerm = term;
        this.currentPage = 1;
        this.applyFilters();
      });
  }

  ngOnInit(): void {
    this.loadEtudiants();

    this.service.getLoading()
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.service.getError()
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        if (error) {
          this.errorMessage = error;
          setTimeout(() => this.errorMessage = '', 5000);
        }
      });
  }

  loadEtudiants(): void {
    this.service.loadAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.allEtudiants = data;

          this.extractFilterOptions();
          this.applyFilters();
        }
      });
  }

  extractFilterOptions(): void {
    this.niveauxUniques = [...new Set(this.allEtudiants.map(e => e.niveau))].sort();
    this.filiereUniques = [...new Set(this.allEtudiants.map(e => e.filiere))].sort();
  }

  applyFilters(): void {
    let filtered = this.allEtudiants;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.nom.toLowerCase().includes(term) ||
        e.prenom.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term) ||
        e.matricule.toLowerCase().includes(term)
      );
    }

    if (this.filterNiveau) {
      filtered = filtered.filter(e => e.niveau === this.filterNiveau);
    }

    if (this.filterFiliere) {
      filtered = filtered.filter(e => e.filiere === this.filterFiliere);
    }

    this.filteredEtudiants = filtered;
    this.totalPages = Math.ceil(this.filteredEtudiants.length / this.pageSize) || 1;
    this.currentPage = 1;
  }

  onSearch(term: string): void {
    this.searchSubject$.next(term);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  get paginatedEtudiants(): Etudiant[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredEtudiants.slice(start, start + this.pageSize);
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  view(id?: number): void {
    if (id) this.router.navigate(['/etudiants', id]);
  }

  edit(id?: number): void {
    if (id) this.router.navigate(['/etudiants/edit', id]);
  }

  openDeleteConfirm(id: number): void {
    this.selectedIdToDelete = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.selectedIdToDelete = null;
  }

  confirmDelete(): void {
    if (!this.selectedIdToDelete) return;

    this.service.delete(this.selectedIdToDelete)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.allEtudiants = this.allEtudiants.filter(e => e.id !== this.selectedIdToDelete);

          this.extractFilterOptions();
          this.applyFilters();

          this.successMessage = 'Étudiant supprimé avec succès';
          this.showDeleteConfirm = false;
          this.selectedIdToDelete = null;

          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Erreur lors de la suppression';
          this.showDeleteConfirm = false;
          this.selectedIdToDelete = null;
        }
      });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterNiveau = '';
    this.filterFiliere = '';
    this.applyFilters();
  }

  get hasFilters(): boolean {
    return !!(this.searchTerm || this.filterNiveau || this.filterFiliere);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}