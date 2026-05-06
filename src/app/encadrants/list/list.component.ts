import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Encadrant } from '../../models/encadrant';
import { EncadrantService } from '../../services/encadrant.service';

@Component({
  selector: 'app-encadrants-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class EncadrantsListComponent implements OnInit, OnDestroy {
  allEncadrants: Encadrant[] = [];
  filteredEncadrants: Encadrant[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';
  pageSize = 5;
  currentPage = 1;
  totalPages = 1;
  searchTerm = '';
  filterGrade = '';
  filterSpecialite = '';
  gradesUniques: string[] = [];
  specialitesUniques: string[] = [];
  selectedIdToDelete: number | null = null;
  showDeleteConfirm = false;
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private service: EncadrantService,
    private router: Router
  ) {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((term) => {
        this.searchTerm = term;
        this.currentPage = 1;
        this.applyFilters();
      });
  }

  ngOnInit(): void {
    this.loadEncadrants();

    this.service.getLoading()
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => this.loading = loading);

    this.service.getError()
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        if (error) {
          this.errorMessage = error;
          setTimeout(() => this.errorMessage = '', 5000);
        }
      });
  }

  loadEncadrants(): void {
    this.service.loadAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.allEncadrants = data;
          this.extractFilterOptions();
          this.applyFilters();
        }
      });
  }

  extractFilterOptions(): void {
    this.gradesUniques = [...new Set(this.allEncadrants.map((e) => e.grade).filter(Boolean))].sort();
    this.specialitesUniques = [...new Set(this.allEncadrants.map((e) => e.specialite).filter(Boolean))].sort();
  }

  applyFilters(): void {
    let filtered = this.allEncadrants;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((e) =>
        e.nom.toLowerCase().includes(term) ||
        e.prenom.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term)
      );
    }

    if (this.filterGrade) {
      filtered = filtered.filter((e) => e.grade === this.filterGrade);
    }

    if (this.filterSpecialite) {
      filtered = filtered.filter((e) => e.specialite === this.filterSpecialite);
    }

    this.filteredEncadrants = filtered;
    this.totalPages = Math.ceil(this.filteredEncadrants.length / this.pageSize);
    this.currentPage = 1;
  }

  onSearch(term: string): void {
    this.searchSubject$.next(term);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  get paginatedEncadrants(): Encadrant[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredEncadrants.slice(startIndex, startIndex + this.pageSize);
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

  view(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/encadrants', id]);
    }
  }

  edit(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/encadrants/edit', id]);
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
            if (this.selectedIdToDelete !== null) {
              this.allEncadrants = this.allEncadrants.filter((e) => e.id !== this.selectedIdToDelete);
              this.extractFilterOptions();
              this.applyFilters();
            }
            this.successMessage = 'Encadrant supprime avec succes';
            this.showDeleteConfirm = false;
            this.selectedIdToDelete = null;
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (error) => {
            this.errorMessage = error.message || 'Erreur lors de la suppression de l encadrant';
            this.showDeleteConfirm = false;
            this.selectedIdToDelete = null;
          }
        });
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterGrade = '';
    this.filterSpecialite = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  get hasFilters(): boolean {
    return this.searchTerm !== '' || this.filterGrade !== '' || this.filterSpecialite !== '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
