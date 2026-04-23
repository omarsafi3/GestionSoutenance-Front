import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Note } from '../models/domain.models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class NotesService extends ApiBaseService {
  findBySoutenance(soutenanceId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl}/notes/soutenance/${soutenanceId}`);
  }

  create(payload: Note): Observable<Note> {
    return this.http.post<Note>(`${this.apiUrl}/notes`, payload);
  }

  update(id: number, payload: Note): Observable<Note> {
    return this.http.put<Note>(`${this.apiUrl}/notes/${id}`, payload);
  }
}
