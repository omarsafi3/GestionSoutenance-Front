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

  constructor(
    private fb: FormBuilder,
    private service: SalleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      capacite: [0, Validators.required],
      localisation: [''],
      disponible: [true]
    });

    this.id = Number(this.route.snapshot.paramMap.get('id'));

    if (this.id) {
      this.service.getById(this.id).subscribe(data => {
        this.form.patchValue(data);
      });
    }
  }

  submit() {
    if (this.id) {
      this.service.update(this.id, this.form.value)
        .subscribe(() => this.router.navigate(['/salles']));
    } else {
      this.service.create(this.form.value)
        .subscribe(() => this.router.navigate(['/salles']));
    }
  }
}