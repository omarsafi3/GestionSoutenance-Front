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

  constructor(
    private fb: FormBuilder,
    private service: EnseignantService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      grade: [''],
      specialite: ['']
    });

    this.id = Number(this.route.snapshot.paramMap.get('id'));

    if (this.id) {
      this.service.getById(this.id).subscribe(data => {
        this.form.patchValue(data);
      });
    }
  }

  submit(): void {

    if (this.id) {
      this.service.update(this.id, this.form.value)
        .subscribe(() => this.router.navigate(['/enseignants']));
    } else {
      this.service.create(this.form.value)
        .subscribe(() => this.router.navigate(['/enseignants']));
    }
  }
}