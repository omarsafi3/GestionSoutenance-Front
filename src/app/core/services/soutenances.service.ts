import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Soutenance } from '../models/domain.models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class SoutenancesService extends ApiBaseService {
  findAll(): Observable<Soutenance[]> {
    return this.http.get<Soutenance[]>(`${this.apiUrl}/soutenances`);
  }
}