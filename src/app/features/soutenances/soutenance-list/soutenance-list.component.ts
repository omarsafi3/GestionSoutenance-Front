import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SoutenanceService } from '../soutenance.service';
import { Soutenance } from '../soutenance.model';

@Component({
  selector: 'app-soutenance-list',
  templateUrl: './soutenance-list.component.html',
  styleUrls: ['./soutenance-list.component.css']
})
export class SoutenanceListComponent implements OnInit {

  soutenances: Soutenance[] = [];
  loading = false;

  constructor(private service: SoutenanceService, private router: Router) {}

  ngOnInit(): void {
    this.service.loadAll().subscribe();
    this.service.getSoutenances().subscribe(data => this.soutenances = data);
    this.service.getLoading().subscribe(l => this.loading = l);
  }

  add() { this.router.navigate(['/soutenances/add']); }
  edit(id?: number) { if (id) this.router.navigate(['/soutenances/edit', id]); }
  delete(id?: number) { if (id) this.service.delete(id).subscribe(); }
}