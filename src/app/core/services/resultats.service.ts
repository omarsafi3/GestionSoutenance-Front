import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Resultat } from '../models/domain.models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class ResultatsService extends ApiBaseService {
  findAll(): Observable<Resultat[]> {
    return this.http.get<Resultat[]>(`${this.apiUrl}/resultats`);
  }

  findById(id: number): Observable<Resultat> {
    return this.http.get<Resultat>(`${this.apiUrl}/resultats/${id}`);
  }

  findBySoutenance(soutenanceId: number): Observable<Resultat> {
    return this.http.get<Resultat>(`${this.apiUrl}/resultats/soutenance/${soutenanceId}`);
  }

  findPublished(): Observable<Resultat[]> {
    return this.http.get<Resultat[]>(`${this.apiUrl}/resultats/published`);
  }

  findByEtudiant(etudiantId: number): Observable<Resultat> {
    return this.http.get<Resultat>(`${this.apiUrl}/resultats/etudiant/${etudiantId}`);
  }

  findMe(): Observable<Resultat> {
    return this.http.get<Resultat>(`${this.apiUrl}/resultats/me`);
  }

  calculate(soutenanceId: number, etudiantId: number): Observable<Resultat> {
    return this.http.post<Resultat>(`${this.apiUrl}/resultats/calculate`, null, {
      params: {
        soutenanceId,
        etudiantId
      }
    });
  }

  calculateBySoutenance(soutenanceId: number): Observable<Resultat> {
    return this.http.post<Resultat>(`${this.apiUrl}/resultats/soutenance/${soutenanceId}/calculer`, null);
  }

  validate(id: number): Observable<Resultat> {
    return this.http.put<Resultat>(`${this.apiUrl}/resultats/${id}/validate`, null);
  }

  publish(id: number): Observable<Resultat> {
    return this.http.put<Resultat>(`${this.apiUrl}/resultats/${id}/publish`, null);
  }

  publishBySoutenance(soutenanceId: number): Observable<Resultat> {
    return this.http.put<Resultat>(`${this.apiUrl}/resultats/soutenance/${soutenanceId}/publier`, null);
  }
}
