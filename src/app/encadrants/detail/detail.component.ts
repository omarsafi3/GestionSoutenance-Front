import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Encadrant } from '../../models/encadrant';
import { EncadrantService } from '../../services/encadrant.service';

@Component({
  selector: 'app-encadrant-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class EncadrantsDetailComponent implements OnInit, OnDestroy {
  encadrant: Encadrant | null = null;
  loading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: EncadrantService
  ) {}

  ngOnInit(): void {
    this.service.getLoading()
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => this.loading = loading);

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage = 'Identifiant encadrant invalide.';
      return;
    }

    this.service.exists(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (exists) => {
          if (!exists) {
            this.errorMessage = 'Encadrant introuvable.';
            return;
          }

          this.service.getById(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (encadrant) => {
                this.encadrant = encadrant;
                this.errorMessage = '';
              },
              error: () => this.errorMessage = 'Impossible de charger les details de l encadrant.'
            });
        },
        error: () => this.errorMessage = 'Impossible de verifier cet encadrant.'
      });
  }

  goToList(): void {
    this.router.navigate(['/encadrants']);
  }

  goToEdit(): void {
    if (this.encadrant?.id) {
      this.router.navigate(['/encadrants/edit', this.encadrant.id]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
