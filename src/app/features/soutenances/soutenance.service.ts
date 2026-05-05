import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Soutenance } from '../../core/models/domain.models';
import { SoutenancesService } from '../../core/services/soutenances.service';

@Injectable({ providedIn: 'root' })
export class SoutenanceService {
  private soutenances$ = new BehaviorSubject<Soutenance[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);

  constructor(private readonly api: SoutenancesService) {}

  getSoutenances() { return this.soutenances$.asObservable(); }
  getLoading() { return this.loading$.asObservable(); }
  getError() { return this.error$.asObservable(); }

  loadAll(): Observable<Soutenance[]> {
    this.loading$.next(true);
    return this.api.findAll().pipe(
      tap(data => {
        this.soutenances$.next(data);
        this.loading$.next(false);
      }),
      catchError(err => {
        this.loading$.next(false);
        this.error$.next('Erreur chargement soutenances');
        return throwError(() => err);
      })
    );
  }

  getById(id: number): Observable<Soutenance> {
    return this.api.findById(id);
  }

  create(data: Soutenance): Observable<Soutenance> {
    return this.api.create(data).pipe(
      tap(newItem => {
        this.soutenances$.next([...this.soutenances$.value, newItem]);
      })
    );
  }

  update(id: number, data: Soutenance): Observable<Soutenance> {
    return this.api.update(id, data).pipe(
      tap(updated => {
        const list = this.soutenances$.value.map(s =>
          s.id === id ? updated : s
        );
        this.soutenances$.next(list);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete(id).pipe(
      tap(() => {
        this.soutenances$.next(
          this.soutenances$.value.filter(s => s.id !== id)
        );
      })
    );
  }
}
