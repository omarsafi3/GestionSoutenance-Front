import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Encadrant } from '../models/domain.models';
import { ApiBaseService } from './api-base.service';

type EncadrantPayload = Pick<Encadrant, 'nom' | 'prenom' | 'email'> & Partial<Pick<Encadrant, 'grade' | 'specialite' | 'password'>>;

@Injectable({ providedIn: 'root' })
export class EncadrantsService extends ApiBaseService {
  findAll(): Observable<Encadrant[]> {
    return this.http.get<Encadrant[]>(`${this.apiUrl}/encadrants`);
  }

  findAvailableForJury(etudiantId: number): Observable<Encadrant[]> {
    const params = new HttpParams().set('etudiantId', etudiantId.toString());
    return this.http.get<Encadrant[]>(`${this.apiUrl}/encadrants/jury/available`, { params });
  }

  findById(id: number): Observable<Encadrant> {
    return this.http.get<Encadrant>(`${this.apiUrl}/encadrants/${id}`);
  }

  findMe(): Observable<Encadrant> {
    return this.http.get<Encadrant>(`${this.apiUrl}/encadrants/me`);
  }

  create(payload: EncadrantPayload): Observable<Encadrant> {
    return this.http.post<Encadrant>(`${this.apiUrl}/encadrants`, payload);
  }

  update(id: number, payload: EncadrantPayload): Observable<Encadrant> {
    return this.http.put<Encadrant>(`${this.apiUrl}/encadrants/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/encadrants/${id}`);
  }
}
