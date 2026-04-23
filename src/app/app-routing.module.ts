import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './etudiants/list/list.component';
import { FormComponent } from './etudiants/form/form.component';
import { DetailComponent } from './etudiants/detail/detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'etudiants', pathMatch: 'full' },
  { path: 'etudiants', component: ListComponent, data: { title: 'Liste des etudiants' } },
  { path: 'etudiants/add', component: FormComponent, data: { title: 'Ajouter un etudiant' } },
  { path: 'etudiants/edit/:id', component: FormComponent, data: { title: 'Modifier etudiant' } },
  { path: 'etudiants/:id', component: DetailComponent, data: { title: 'Detail etudiant' } },
  // Catch-all route
  { path: '**', redirectTo: 'etudiants' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}