import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Encadrant } from '../models/encadrant';
import { EncadrantsService } from '../core/services/encadrants.service';

@Injectable({
  providedIn: 'root'
})
export class EncadrantService {
  private encadrants$ = new BehaviorSubject<Encadrant[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);

  constructor(private readonly api: EncadrantsService) {}

  private extractErrorMessage(err: any, fallback: string): string {
    const backendMessage =
      typeof err?.error === 'string'
        ? err.error
        : err?.error?.message || err?.message;

    return backendMessage && backendMessage.trim() ? backendMessage : fallback;
  }

  getEncadrants(): Observable<Encadrant[]> {
    return this.encadrants$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  getError(): Observable<string | null> {
    return this.error$.asObservable();
  }

  loadAll(): Observable<Encadrant[]> {
    this.loading$.next(true);
    this.error$.next(null);

    return this.api.findAll().pipe(
      tap((data) => {
        this.encadrants$.next(data);
        this.loading$.next(false);
      }),
      catchError((err) => {
        const errorMsg = this.extractErrorMessage(err, 'Erreur lors du chargement des encadrants');
        this.error$.next(errorMsg);
        this.loading$.next(false);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  getById(id: number): Observable<Encadrant> {
    this.loading$.next(true);
    this.error$.next(null);

    return this.api.findById(id).pipe(
      tap(() => this.loading$.next(false)),
      catchError((err) => {
        const errorMsg = this.extractErrorMessage(err, 'Erreur lors du chargement de l encadrant');
        this.error$.next(errorMsg);
        this.loading$.next(false);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  exists(id: number): Observable<boolean> {
    return this.api.findById(id).pipe(
      map(() => true),
      catchError((err) => {
        const errorMsg = this.extractErrorMessage(err, 'Erreur lors de la verification de l encadrant');
        this.error$.next(errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  create(encadrant: Encadrant): Observable<Encadrant> {
    this.loading$.next(true);
    this.error$.next(null);

    return this.api.create(encadrant).pipe(
      tap((newEncadrant) => {
        const current = this.encadrants$.value;
        this.encadrants$.next([...current, newEncadrant]);
        this.loading$.next(false);
      }),
      catchError((err) => {
        const errorMsg = this.extractErrorMessage(err, 'Erreur lors de la creation de l encadrant');
        this.error$.next(errorMsg);
        this.loading$.next(false);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  update(id: number, encadrant: Encadrant): Observable<Encadrant> {
    this.loading$.next(true);
    this.error$.next(null);

    return this.api.update(id, encadrant).pipe(
      tap((updatedEncadrant) => {
        const current = this.encadrants$.value;
        const index = current.findIndex((e) => e.id === id);
        if (index !== -1) {
          current[index] = updatedEncadrant;
          this.encadrants$.next([...current]);
        }
        this.loading$.next(false);
      }),
      catchError((err) => {
        const errorMsg = this.extractErrorMessage(err, 'Erreur lors de la modification de l encadrant');
        this.error$.next(errorMsg);
        this.loading$.next(false);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  delete(id: number): Observable<void> {
    this.loading$.next(true);
    this.error$.next(null);

    return this.api.delete(id).pipe(
      tap(() => {
        const current = this.encadrants$.value;
        this.encadrants$.next(current.filter((e) => e.id !== id));
        this.loading$.next(false);
      }),
      catchError((err) => {
        const errorMsg = this.extractErrorMessage(err, 'Erreur lors de la suppression de l encadrant');
        this.error$.next(errorMsg);
        this.loading$.next(false);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  clearError(): void {
    this.error$.next(null);
  }
}
