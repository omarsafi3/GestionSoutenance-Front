import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Etudiant } from '../../models/etudiant';
import { EtudiantService } from '../../services/etudiant.service';

@Component({
  selector: 'app-etudiant-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit, OnDestroy {
  etudiant: Etudiant | null = null;
  loading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: EtudiantService
  ) {}

  ngOnInit(): void {
    this.service.getLoading()
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => this.loading = loading);

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage = 'Identifiant etudiant invalide.';
      return;
    }

    this.service.exists(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (exists) => {
          if (!exists) {
            this.errorMessage = 'Etudiant introuvable.';
            return;
          }

          this.service.getById(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (etudiant) => {
                this.etudiant = etudiant;
                this.errorMessage = '';
              },
              error: () => {
                this.errorMessage = 'Impossible de charger les details de l etudiant.';
              }
            });
        },
        error: () => {
          this.errorMessage = 'Impossible de verifier cet etudiant.';
        }
      });
  }

  goToList(): void {
    this.router.navigate(['/etudiants']);
  }

  goToEdit(): void {
    if (this.etudiant?.id) {
      this.router.navigate(['/etudiants/edit', this.etudiant.id]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
