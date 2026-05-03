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
  loading = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  enseignants: any[] = [];

  private etudiantId: number | null = null;
  private destroy$ = new Subject<void>();

  niveaux = [
    'Licence 1', 'Licence 2', 'Licence 3',
    'Master 1', 'Master 2',
    '1ère année préparatoire', '2ème année préparatoire',
    '1ère année cycle ingénieur', '2ème année cycle ingénieur', '3ème année cycle ingénieur',
    '1ère année doctorat', '2ème année doctorat', '3ème année doctorat'
  ];

  filieres = [
    'Informatique',
    'Génie Logiciel',
    'Réseaux & Sécurité',
    'IA & Data Science'
  ];

  constructor(
    private fb: FormBuilder,
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
      this.etudiantId = +id;
      this.loadEtudiant(this.etudiantId);
    }

    this.service.getLoading()
      .pipe(takeUntil(this.destroy$))
      .subscribe(l => this.loading = l);

    this.service.getError()
      .pipe(takeUntil(this.destroy$))
      .subscribe(err => {
        if (err) this.errorMessage = err;
      });
    this.service.getEnseignants()
  .subscribe(data => {
    this.enseignants = data;
  });
  }

  initForm(): void {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      matricule: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]+$/i)]],
      filiere: ['', Validators.required],
      niveau: ['', Validators.required],

      encadrantId: [null]   // IMPORTANT
    });
  }

  loadEtudiant(id: number): void {
    this.service.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.form.patchValue(data),
        error: () => {
          this.errorMessage = "Erreur lors du chargement de l'étudiant";
        }
      });
  }

  get f() {
    return this.form.controls;
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.submitted));
  }

  getFieldError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';

    if (ctrl.errors['required']) return `${field} est obligatoire`;
    if (ctrl.errors['minlength']) return `Trop court`;
    if (ctrl.errors['email']) return `Email invalide`;
    if (ctrl.errors['pattern']) return `Format invalide`;

    return 'Erreur';
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) return;

    const payload: Etudiant = this.form.value;

    if (this.isEditMode && this.etudiantId) {
      this.service.update(this.etudiantId, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.router.navigate(['/etudiants']),
          error: (err) => this.errorMessage = err.message
        });
    } else {
      this.service.create(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.router.navigate(['/etudiants']),
          error: (err) => this.errorMessage = err.message
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