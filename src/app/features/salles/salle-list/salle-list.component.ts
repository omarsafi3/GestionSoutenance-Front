import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SalleService } from '../salle.service';
import { Salle } from '../salle.model';

@Component({
  selector: 'app-salle-list',
  templateUrl: './salle-list.component.html',
  styleUrls: ['./salle-list.component.css']
})
export class SalleListComponent implements OnInit {

  salles: Salle[] = [];
  loading = false;

  constructor(
    private service: SalleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.service.loadAll().subscribe();
    this.service.getSalles().subscribe(data => this.salles = data);
    this.service.getLoading().subscribe(l => this.loading = l);
  }

  add() { this.router.navigate(['/salles/add']); }
  edit(id?: number) { if (id) this.router.navigate(['/salles/edit', id]); }
  delete(id?: number) { if (id) this.service.delete(id).subscribe(); }
}