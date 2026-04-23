import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EtudiantService } from '../../services/etudiant.service';
import { Etudiant } from '../../models/etudiant';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-etudiant-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = false;
  successMessage = '';
  errorMessage = '';
  loading = false;
  submitted = false;

  private etudiantId: number | null = null;
  private destroy$ = new Subject<void>();

  // Options pour les selects
  niveaux = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', '1ère année préparatoire',
    '2ème année préparatoire', '1ère année cycle ingénieur','2ème année cycle ingénieur','3ème année cycle ingénieur',
    '1ère année doctorat','2ème année doctorat','3ème année doctorat' ];
  filieres = ['Informatique', 'Génie Logiciel', 'Réseaux & Sécurité', 'IA & Data Science'];

  constructor(
    private formBuilder: FormBuilder,
    private service: EtudiantService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.etudiantId = parseInt(id);
      this.loadEtudiant(this.etudiantId);
    }

    // S'abonner aux changements du service
    this.service.getLoading()
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.service.getError()
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
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
      matricule: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]+$/i)]],
      filiere: ['', Validators.required],
      niveau: ['', Validators.required]
    });
  }

  loadEtudiant(id: number): void {
    this.service.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (etudiant) => {
          this.form.patchValue(etudiant);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Erreur lors du chargement de l\'étudiant';
        },
      });
  }

  // Getters pour accès facile aux contrôles
  get f() {
    return this.form.controls;
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
      const minLength = fieldControl.errors['minlength'].requiredLength;
      return `${this.getFieldLabel(field)} doit contenir au moins ${minLength} caractères`;
    }
    if (fieldControl.errors['email']) {
      return 'Adresse email invalide';
    }
    if (fieldControl.errors['pattern']) {
      return `${this.getFieldLabel(field)} contient des caractères invalides`;
    }
    return 'Erreur de validation';
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      nom: 'Nom',
      prenom: 'Prénom',
      email: 'Email',
      matricule: 'Matricule',
      filiere: 'Filière',
      niveau: 'Niveau'
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

    const etudiant: Etudiant = this.form.value;

    if (this.isEditMode && this.etudiantId) {
      this.service.update(this.etudiantId, etudiant)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Étudiant modifié avec succès';
            setTimeout(() => {
              this.router.navigate(['/etudiants']);
            }, 2000);
          },
          error: (error) => {
            this.errorMessage = error.message || 'Erreur lors de la modification de l\'étudiant';
          },
        });
    } else {
      this.service.create(etudiant)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.successMessage = 'Étudiant créé avec succès';
            setTimeout(() => {
              this.router.navigate(['/etudiants']);
            }, 2000);
          },
          error: (error) => {
            this.errorMessage = error.message || 'Erreur lors de la création de l\'étudiant';
          },
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/etudiants']);
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