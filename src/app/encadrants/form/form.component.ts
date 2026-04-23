import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Encadrant } from '../../models/encadrant';
import { EncadrantService } from '../../services/encadrant.service';

@Component({
  selector: 'app-encadrant-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class EncadrantsFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = false;
  successMessage = '';
  errorMessage = '';
  loading = false;
  submitted = false;
  private encadrantId: number | null = null;
  private destroy$ = new Subject<void>();

  grades = ['Professeur', 'Maitre de conferences', 'Docteur', 'Ingenieur'];
  specialites = [
    'Informatique',
    'Genie logiciel',
    'IA et data science',
    'Reseaux et securite',
    'Systemes embarques'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private service: EncadrantService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.encadrantId = parseInt(id, 10);
      this.loadEncadrant(this.encadrantId);
    }

    this.service.getLoading()
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => this.loading = loading);

    this.service.getError()
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        if (error) {
          this.errorMessage = error;
        }
      });
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      grade: ['', Validators.required],
      specialite: ['', Validators.required]
    });
  }

  loadEncadrant(id: number): void {
    this.service.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (encadrant) => this.form.patchValue(encadrant),
        error: (error) => this.errorMessage = error.message || 'Erreur lors du chargement de l encadrant'
      });
  }

  isFieldInvalid(field: string): boolean {
    const fieldControl = this.form.get(field);
    return !!(fieldControl && fieldControl.invalid && (fieldControl.dirty || fieldControl.touched || this.submitted));
  }

  getFieldError(field: string): string {
    const fieldControl = this.form.get(field);
    if (!fieldControl || !fieldControl.errors) {
      return '';
    }

    if (fieldControl.errors['required']) {
      return `${this.getFieldLabel(field)} est obligatoire`;
    }
    if (fieldControl.errors['minlength']) {
      return `${this.getFieldLabel(field)} doit contenir au moins ${fieldControl.errors['minlength'].requiredLength} caractères`;
    }
    if (fieldControl.errors['email']) {
      return 'Adresse email invalide';
    }
    return 'Erreur de validation';
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      nom: 'Nom',
      prenom: 'Prénom',
      email: 'Email',
      grade: 'Grade',
      specialite: 'Spécialité'
    };
    return labels[field] || field;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire';
      return;
    }

    const encadrant: Encadrant = this.form.value;

    if (this.isEditMode && this.encadrantId) {
      this.service.update(this.encadrantId, encadrant)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Encadrant modifié avec succès';
            setTimeout(() => this.router.navigate(['/encadrants']), 1800);
          },
          error: (error) => this.errorMessage = error.message || 'Erreur lors de la modification de l encadrant'
        });
    } else {
      this.service.create(encadrant)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Encadrant créé avec succès';
            setTimeout(() => this.router.navigate(['/encadrants']), 1800);
          },
          error: (error) => this.errorMessage = error.message || 'Erreur lors de la création de l encadrant'
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/encadrants']);
  }

  resetForm(): void {
    this.form.reset();
    this.submitted = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
