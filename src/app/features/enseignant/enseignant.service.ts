import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Enseignant } from './enseignant.model';
import { EncadrantsService } from '../../core/services/encadrants.service';

@Injectable({
  providedIn: 'root'
})
export class EnseignantService {
  private enseignants$ = new BehaviorSubject<Enseignant[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);

  constructor(private readonly api: EncadrantsService) {}

  getEnseignants(): Observable<Enseignant[]> {
    return this.enseignants$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  getError(): Observable<string | null> {
    return this.error$.asObservable();
  }

  loadAll(): Observable<Enseignant[]> {
    this.loading$.next(true);

    return this.api.findAll().pipe(
      tap(data => {
        this.enseignants$.next(data);
        this.loading$.next(false);
      }),
      catchError(err => {
        this.loading$.next(false);
        this.error$.next('Erreur chargement enseignants');
        return throwError(() => err);
      })
    );
  }

  getById(id: number): Observable<Enseignant> {
    return this.api.findById(id);
  }

  create(data: Enseignant): Observable<Enseignant> {
    return this.api.create(data).pipe(
      tap(newItem => {
        this.enseignants$.next([...this.enseignants$.value, newItem]);
      })
    );
  }

  update(id: number, data: Enseignant): Observable<Enseignant> {
    return this.api.update(id, data).pipe(
      tap(updated => {
        const list = this.enseignants$.value.map(e =>
          e.id === id ? updated : e
        );
        this.enseignants$.next(list);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete(id).pipe(
      tap(() => {
        this.enseignants$.next(
          this.enseignants$.value.filter(e => e.id !== id)
        );
      })
    );
  }
}
