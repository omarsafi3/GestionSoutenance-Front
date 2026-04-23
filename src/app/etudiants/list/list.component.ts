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
  // Data
  allEtudiants: Etudiant[] = [];
  filteredEtudiants: Etudiant[] = [];
  
  // State
  loading = false;
  successMessage = '';
  errorMessage = '';
  
  // Pagination
  pageSize = 5;
  currentPage = 1;
  totalPages = 1;
  
  // Search & Filter
  searchTerm = '';
  filterNiveau = '';
  filterFiliere = '';
  
  // Options uniques pour les filtres
  niveauxUniques: string[] = [];
  filiereUniques: string[] = [];
  
  // Modal delete
  selectedIdToDelete: number | null = null;
  showDeleteConfirm = false;
  
  // Cleanup
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private service: EtudiantService,
    private router: Router
  ) {
    // Debounce la recherche
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
    
    // S'abonner aux changements du service
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

    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.nom.toLowerCase().includes(term) ||
        e.prenom.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term) ||
        e.matricule.toLowerCase().includes(term)
      );
    }

    // Filtre par niveau
    if (this.filterNiveau) {
      filtered = filtered.filter(e => e.niveau === this.filterNiveau);
    }

    // Filtre par filière
    if (this.filterFiliere) {
      filtered = filtered.filter(e => e.filiere === this.filterFiliere);
    }

    this.filteredEtudiants = filtered;
    this.totalPages = Math.ceil(this.filteredEtudiants.length / this.pageSize);
    this.currentPage = 1;
  }

  onSearch(term: string): void {
    this.searchSubject$.next(term);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  // Pagination
  get paginatedEtudiants(): Etudiant[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredEtudiants.slice(startIndex, startIndex + this.pageSize);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Actions CRUD
  edit(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/etudiants/edit', id]);
    }
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
    if (this.selectedIdToDelete) {
      this.service.delete(this.selectedIdToDelete)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Étudiant supprimé avec succès';
            this.showDeleteConfirm = false;
            this.selectedIdToDelete = null;
            setTimeout(() => this.successMessage = '', 3000);
          }
        });
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterNiveau = '';
    this.filterFiliere = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  get hasFilters(): boolean {
    return this.searchTerm !== '' || this.filterNiveau !== '' || this.filterFiliere !== '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}