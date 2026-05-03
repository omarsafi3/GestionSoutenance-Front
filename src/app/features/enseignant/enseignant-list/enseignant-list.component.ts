import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EnseignantService } from '../enseignant.service';
import { Enseignant } from '../enseignant.model';

@Component({
  selector: 'app-enseignant-list',
  templateUrl: './enseignant-list.component.html',
  styleUrl: './enseignant-list.component.css'
})
export class EnseignantListComponent implements OnInit {

  enseignants: Enseignant[] = [];
  loading = false;

  constructor(
    private service: EnseignantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.loadAll().subscribe();
    this.service.getEnseignants().subscribe(data => {
      this.enseignants = data;
    });

    this.service.getLoading().subscribe(l => this.loading = l);
  }

  delete(id?: number): void {
    if (!id) return;
    this.service.delete(id).subscribe();
  }

  edit(id?: number): void {
    if (!id) return;
    this.router.navigate(['/enseignants/edit', id]);
  }

  add(): void {
    this.router.navigate(['/enseignants/add']);
  }
}