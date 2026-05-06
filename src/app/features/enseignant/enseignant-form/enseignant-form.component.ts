import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EnseignantService } from '../enseignant.service';

@Component({
  selector: 'app-enseignant-form',
  templateUrl: './enseignant-form.component.html',
  styleUrl: './enseignant-form.component.css'
})
export class EnseignantFormComponent implements OnInit {
  form!: FormGroup;
  id?: number;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private service: EnseignantService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id')) || undefined;

    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      grade: [''],
      specialite: [''],
      password: ['', this.id ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)]]
    });

    if (this.id) {
      this.service.getById(this.id).subscribe(data => {
        this.form.patchValue(data);
      });
    }
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = { ...this.form.value };
    if (!payload.password) {
      delete payload.password;
    }

    if (this.id) {
      this.service.update(this.id, payload)
        .subscribe(() => this.router.navigate(['/enseignants']));
    } else {
      this.service.create(payload)
        .subscribe(() => this.router.navigate(['/enseignants']));
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
    if (field === 'email' && ctrl.errors['email']) return 'Adresse email invalide';
    if (field === 'password' && ctrl.errors['minlength']) return 'Au moins 6 caracteres';
    return 'Valeur invalide';
  }
}
