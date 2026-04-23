import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Encadrant } from '../models/domain.models';
import { ApiBaseService } from './api-base.service';

@Injectable({ providedIn: 'root' })
export class EncadrantsService extends ApiBaseService {
  findAll(): Observable<Encadrant[]> {
    return this.http.get<Encadrant[]>(`${this.apiUrl}/encadrants`);
  }
}