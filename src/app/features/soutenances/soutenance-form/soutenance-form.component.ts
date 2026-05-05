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
      duree: [0, Validators.required],
      statut: ['PLANIFIEE'],

      presidentId: ['', Validators.required],
      rapporteurId: ['', Validators.required],
      examinateurId: ['', Validators.required],
      salleId: ['', Validators.required],
      etudiantId: ['', Validators.required]
    });

    this.id = Number(this.route.snapshot.paramMap.get('id'));

    if (this.id) {
      this.service.getById(this.id).subscribe(data => {
        this.form.patchValue(data);
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
  }

  submit() {
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
      .subscribe(() => this.router.navigate(['/soutenances']));
  } else {
    this.service.create(payload)
      .subscribe(() => this.router.navigate(['/soutenances']));
  }
}
}
