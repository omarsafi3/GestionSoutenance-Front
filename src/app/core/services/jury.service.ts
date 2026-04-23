import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Jury } from '../models/domain.models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class JuryService extends ApiBaseService {
  constructor(http: HttpClient) {
    super(http);
  }

  findBySoutenance(soutenanceId: number): Observable<Jury> {
    return this.http.get<Jury>(`${this.apiUrl}/jurys/soutenance/${soutenanceId}`);
  }

  affecter(payload: Jury): Observable<Jury> {
    return this.http.post<Jury>(`${this.apiUrl}/jurys`, payload);
  }

  delete(soutenanceId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/jurys/soutenance/${soutenanceId}`);
  }
}
