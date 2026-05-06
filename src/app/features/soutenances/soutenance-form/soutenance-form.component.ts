import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SoutenanceService } from '../soutenance.service';
import { Enseignant } from '../../enseignant/enseignant.model';
import { Salle } from '../../salles/salle.model';
import { Etudiant } from '../../../models/etudiant';
import { EnseignantService } from '../../enseignant/enseignant.service';
import { SalleService } from '../../salles/salle.service';
import { EtudiantService } from '../../../services/etudiant.service';
import { Soutenance } from '../../../core/models/domain.models';


@Component({
  selector: 'app-soutenance-form',
  templateUrl: './soutenance-form.component.html',
  styleUrls: ['./soutenance-form.component.css']
})
export class SoutenanceFormComponent implements OnInit {

  form!: FormGroup;
  id?: number;
  enseignants: Enseignant[] = [];
  salles: Salle[] = [];
  etudiants: Etudiant[] = [];
  soutenances: Soutenance[] = [];
  submitted = false;
  loading = false;
  errorMessage = '';
  isFinished = false;
  

  constructor(
    private fb: FormBuilder,
    private service: SoutenanceService,
    private enseignantService: EnseignantService,
    private salleService: SalleService,
    private etudiantService: EtudiantService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.form = this.fb.group({
      titre: ['', Validators.required],
      date: ['', Validators.required],
      duree: [60, [Validators.required, Validators.min(1)]],
      statut: ['PLANIFIEE'],

      presidentId: ['', Validators.required],
      rapporteurId: ['', Validators.required],
      examinateurId: ['', Validators.required],
      salleId: ['', Validators.required],
      etudiantId: ['', Validators.required]
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
        this.isFinished = data.statut === 'TERMINEE';
        if (this.isFinished) {
          this.form.disable();
        }
      });
    }
    this.enseignantService.loadAll().subscribe();
    this.enseignantService.getEnseignants().subscribe(data => {
      this.enseignants = data;
    });
    this.salleService.loadAll().subscribe();
    this.salleService.getSalles().subscribe(data => {
      this.salles = data;
    });
    this.etudiantService.loadAll().subscribe();
    this.etudiantService.getEtudiants().subscribe(data => {
      this.etudiants = data;
    });
    this.service.loadAll().subscribe();
    this.service.getSoutenances().subscribe(data => {
      this.soutenances = data;
    });
  }

  submit(): void {
  this.submitted = true;
  this.errorMessage = '';
  if (this.isFinished) {
    this.errorMessage = 'Une soutenance terminee ne peut plus etre modifiee.';
    return;
  }
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.errorMessage = 'Veuillez corriger les erreurs du formulaire.';
    return;
  }
  const v = this.form.value;

  const payload = {
    ...v,

    // FIX 1: LocalDateTime format
    date: v.date.length === 16 ? v.date + ':00' : v.date,

    // FIX 2: convert IDs to numbers
    presidentId: Number(v.presidentId),
    rapporteurId: Number(v.rapporteurId),
    examinateurId: Number(v.examinateurId),
    salleId: Number(v.salleId),
    etudiantId: Number(v.etudiantId),
  };

  if (this.id) {
    this.service.update(this.id, payload)
      .subscribe({
        next: () => this.router.navigate(['/soutenances']),
        error: err => (this.errorMessage = err.message || 'Modification impossible.')
      });
  } else {
    this.service.create(payload)
      .subscribe({
        next: () => this.router.navigate(['/soutenances']),
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
    if (ctrl.errors['min']) return 'Valeur invalide';
    return 'Valeur invalide';
  }

  get etudiantsDisponibles(): Etudiant[] {
    const currentEtudiantId = Number(this.form?.get('etudiantId')?.value);
    const assignedIds = new Set(
      this.soutenances
        .filter(s => !this.id || s.id !== this.id)
        .map(s => s.etudiantId)
        .filter((id): id is number => id != null)
    );

    return this.etudiants.filter(etudiant =>
      etudiant.id != null && (!assignedIds.has(etudiant.id) || etudiant.id === currentEtudiantId)
    );
  }
}
