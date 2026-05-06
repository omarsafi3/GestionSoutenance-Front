import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SalleService } from '../salle.service';

@Component({
  selector: 'app-salle-form',
  templateUrl: './salle-form.component.html',
  styleUrls: ['./salle-form.component.css']
})
export class SalleFormComponent implements OnInit {

  form!: FormGroup;
  id?: number;
  submitted = false;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private service: SalleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      capacite: [1, [Validators.required, Validators.min(1)]],
      localisation: [''],
      disponible: [true]
    });

    this.service.getLoading().subscribe(loading => (this.loading = loading));
    this.service.getError().subscribe(error => {
      if (error) {
        this.errorMessage = error;
      }
    });

    this.id = Number(this.route.snapshot.paramMap.get('id'));

    if (this.id) {
      this.service.getById(this.id).subscribe(data => {
        this.form.patchValue(data);
      });
    }
  }

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire.';
      return;
    }

    const payload = {
      ...this.form.value,
      capacite: Number(this.form.value.capacite)
    };

    if (this.id) {
      this.service.update(this.id, payload)
        .subscribe({
          next: () => this.router.navigate(['/salles']),
          error: err => (this.errorMessage = err.message || 'Modification impossible.')
        });
    } else {
      this.service.create(payload)
        .subscribe({
          next: () => this.router.navigate(['/salles']),
          error: err => (this.errorMessage = err.message || 'Creation impossible.')
        });
    }
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.submitted));
  }

  getFieldError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return `${field} est obligatoire`;
    if (ctrl.errors['min']) return 'La capacite doit etre superieure a 0';
    return 'Valeur invalide';
  }
}
