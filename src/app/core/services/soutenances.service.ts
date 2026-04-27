import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Soutenance } from '../models/domain.models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class SoutenancesService extends ApiBaseService {
  findAll(): Observable<Soutenance[]> {
    return this.http.get<Soutenance[]>(`${this.apiUrl}/soutenances`);
  }

  findById(id: number): Observable<Soutenance> {
    return this.http.get<Soutenance>(`${this.apiUrl}/soutenances/${id}`);
  }

  findByEtudiant(etudiantId: number): Observable<Soutenance[]> {
    return this.http.get<Soutenance[]>(`${this.apiUrl}/soutenances/etudiant/${etudiantId}`);
  }

  create(payload: Soutenance): Observable<Soutenance> {
    return this.http.post<Soutenance>(`${this.apiUrl}/soutenances`, payload);
  }

  update(id: number, payload: Soutenance): Observable<Soutenance> {
    return this.http.put<Soutenance>(`${this.apiUrl}/soutenances/${id}`, payload);
  }

  updateStatut(id: number, statut: string): Observable<Soutenance> {
    return this.http.patch<Soutenance>(`${this.apiUrl}/soutenances/${id}/statut`, null, {
      params: { statut }
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/soutenances/${id}`);
  }
}
