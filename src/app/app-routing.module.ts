import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './etudiants/list/list.component';
import { FormComponent } from './etudiants/form/form.component';
import { DetailComponent } from './etudiants/detail/detail.component';
import { EncadrantsListComponent } from './encadrants/list/list.component';
import { EncadrantsFormComponent } from './encadrants/form/form.component';
import { EncadrantsDetailComponent } from './encadrants/detail/detail.component';
import { NotesPageComponent } from './features/notes/pages/notes-page.component';
import { LoginPageComponent } from './core/auth/login-page.component';
import { roleGuard } from './core/auth/guards/role.guard';
import { EnseignantListComponent } from './features/enseignant/enseignant-list/enseignant-list.component';
import { EnseignantFormComponent } from './features/enseignant/enseignant-form/enseignant-form.component';
import { SalleListComponent } from './features/salles/salle-list/salle-list.component';
import { SalleFormComponent } from './features/salles/salle-form/salle-form.component';
import { SoutenanceListComponent } from './features/soutenances/soutenance-list/soutenance-list.component';
import { SoutenanceFormComponent } from './features/soutenances/soutenance-form/soutenance-form.component';
import { ResultatsPageComponent } from './features/resultats/pages/resultats-page.component';
import { UnauthorizedPageComponent } from './core/auth/unauthorized-page.component';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent, data: { title: 'Connexion' } },
  { path: 'unauthorized', component: UnauthorizedPageComponent, data: { title: 'Acces refuse' } },
  { path: '', component: DashboardPageComponent, canActivate: [roleGuard], data: { title: 'Tableau de bord', roles: ['ADMIN', 'ENSEIGNANT', 'ETUDIANT'] } },
  { path: 'etudiants', component: ListComponent, canActivate: [roleGuard], data: { title: 'Liste des etudiants', roles: ['ADMIN'] } },
  { path: 'etudiants/add', component: FormComponent, canActivate: [roleGuard], data: { title: 'Ajouter un etudiant', roles: ['ADMIN'] } },
  { path: 'etudiants/edit/:id', component: FormComponent, canActivate: [roleGuard], data: { title: 'Modifier etudiant', roles: ['ADMIN'] } },
  { path: 'etudiants/:id', component: DetailComponent, canActivate: [roleGuard], data: { title: 'Detail etudiant', roles: ['ADMIN', 'ENSEIGNANT'] } },
  { path: 'encadrants', component: EncadrantsListComponent, canActivate: [roleGuard], data: { title: 'Liste des encadrants', roles: ['ADMIN'] } },
  { path: 'encadrants/add', component: EncadrantsFormComponent, canActivate: [roleGuard], data: { title: 'Ajouter un encadrant', roles: ['ADMIN'] } },
  { path: 'encadrants/edit/:id', component: EncadrantsFormComponent, canActivate: [roleGuard], data: { title: 'Modifier encadrant', roles: ['ADMIN'] } },
  { path: 'encadrants/:id', component: EncadrantsDetailComponent, canActivate: [roleGuard], data: { title: 'Detail encadrant', roles: ['ADMIN'] } },
  { path: 'notes', component: NotesPageComponent, canActivate: [roleGuard], data: { title: 'Gestion des notes', roles: ['ENSEIGNANT'] } },
  { path: 'enseignants', component: EnseignantListComponent, canActivate: [roleGuard], data: { title: 'Liste des enseignants', roles: ['ADMIN'] } },
  { path: 'enseignants/add', component: EnseignantFormComponent, canActivate: [roleGuard], data: { title: 'Ajouter enseignant', roles: ['ADMIN'] } },
  { path: 'enseignants/edit/:id', component: EnseignantFormComponent, canActivate: [roleGuard], data: { title: 'Modifier enseignant', roles: ['ADMIN'] } },
  { path: 'salles', component: SalleListComponent, canActivate: [roleGuard], data: { title: 'Liste des salles', roles: ['ADMIN'] } },
  { path: 'salles/add', component: SalleFormComponent, canActivate: [roleGuard], data: { title: 'Ajouter une salle', roles: ['ADMIN'] } },
  { path: 'salles/edit/:id', component: SalleFormComponent, canActivate: [roleGuard], data: { title: 'Modifier salle', roles: ['ADMIN'] } },
  { path: 'soutenances', component: SoutenanceListComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'ENSEIGNANT', 'ETUDIANT'] } },
  { path: 'soutenances/add', component: SoutenanceFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'soutenances/edit/:id', component: SoutenanceFormComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'resultats', component: ResultatsPageComponent, canActivate: [roleGuard], data: { title: 'Resultats', roles: ['ADMIN', 'ENSEIGNANT', 'ETUDIANT'] } },
  // Catch-all route
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
