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
      .subscribe(l => this.loading = l);

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage = 'Identifiant étudiant invalide.';
      return;
    }

    this.service.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.etudiant = data;
          this.errorMessage = '';
        },
        error: () => {
          this.errorMessage = 'Impossible de charger les détails de l étudiant.';
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