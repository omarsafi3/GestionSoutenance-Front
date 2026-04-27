import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './etudiants/list/list.component';
import { FormComponent } from './etudiants/form/form.component';
import { DetailComponent } from './etudiants/detail/detail.component';
import { EncadrantsListComponent } from './encadrants/list/list.component';
import { EncadrantsFormComponent } from './encadrants/form/form.component';
import { EncadrantsDetailComponent } from './encadrants/detail/detail.component';
import { JurysPageComponent } from './features/jurys/pages/jurys-page.component';
import { NotesPageComponent } from './features/notes/pages/notes-page.component';
import { LoginPageComponent } from './core/auth/login-page.component';
import { roleGuard } from './core/auth/guards/role.guard';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent, data: { title: 'Connexion' } },
  { path: '', redirectTo: 'etudiants', pathMatch: 'full' },
  { path: 'etudiants', component: ListComponent, canActivate: [roleGuard], data: { title: 'Liste des etudiants', roles: ['ADMIN', 'ENSEIGNANT'] } },
  { path: 'etudiants/add', component: FormComponent, canActivate: [roleGuard], data: { title: 'Ajouter un etudiant', roles: ['ADMIN'] } },
  { path: 'etudiants/edit/:id', component: FormComponent, canActivate: [roleGuard], data: { title: 'Modifier etudiant', roles: ['ADMIN'] } },
  { path: 'etudiants/:id', component: DetailComponent, canActivate: [roleGuard], data: { title: 'Detail etudiant', roles: ['ADMIN', 'ENSEIGNANT'] } },
  { path: 'encadrants', component: EncadrantsListComponent, canActivate: [roleGuard], data: { title: 'Liste des encadrants', roles: ['ADMIN', 'ENSEIGNANT'] } },
  { path: 'encadrants/add', component: EncadrantsFormComponent, canActivate: [roleGuard], data: { title: 'Ajouter un encadrant', roles: ['ADMIN'] } },
  { path: 'encadrants/edit/:id', component: EncadrantsFormComponent, canActivate: [roleGuard], data: { title: 'Modifier encadrant', roles: ['ADMIN'] } },
  { path: 'encadrants/:id', component: EncadrantsDetailComponent, canActivate: [roleGuard], data: { title: 'Detail encadrant', roles: ['ADMIN', 'ENSEIGNANT'] } },
  { path: 'jurys', component: JurysPageComponent, canActivate: [roleGuard], data: { title: 'Gestion des jurys', roles: ['ADMIN'] } },
  { path: 'notes', component: NotesPageComponent, canActivate: [roleGuard], data: { title: 'Gestion des notes', roles: ['ADMIN', 'ENSEIGNANT'] } },
  // Catch-all route
  { path: '**', redirectTo: 'etudiants' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
