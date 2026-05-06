import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Salle } from './salle.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SalleService {

  private apiUrl = `${environment.apiUrl}/salles`;

  private salles$ = new BehaviorSubject<Salle[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  getSalles() { return this.salles$.asObservable(); }
  getLoading() { return this.loading$.asObservable(); }
  getError() { return this.error$.asObservable(); }

  loadAll(): Observable<Salle[]> {
    this.loading$.next(true);
    this.error$.next(null);

    return this.http.get<Salle[]>(this.apiUrl).pipe(
      tap(data => {
        this.salles$.next(data);
        this.loading$.next(false);
      }),
      catchError(err => {
        this.loading$.next(false);
        this.error$.next('Erreur chargement salles');
        return throwError(() => err);
      })
    );
  }

  getById(id: number): Observable<Salle> {
    return this.http.get<Salle>(`${this.apiUrl}/${id}`);
  }

  create(data: Salle): Observable<Salle> {
    this.loading$.next(true);
    this.error$.next(null);
    return this.http.post<Salle>(this.apiUrl, data).pipe(
      tap(newItem => {
        this.salles$.next([...this.salles$.value, newItem]);
        this.loading$.next(false);
      }),
      catchError(err => {
        const message = this.extractErrorMessage(err, 'Enregistrement de la salle impossible');
        this.error$.next(message);
        this.loading$.next(false);
        return throwError(() => new Error(message));
      })
    );
  }

  update(id: number, data: Salle): Observable<Salle> {
    this.loading$.next(true);
    this.error$.next(null);
    return this.http.put<Salle>(`${this.apiUrl}/${id}`, data).pipe(
      tap(updated => {
        const list = this.salles$.value.map(s =>
          s.id === id ? updated : s
        );
        this.salles$.next(list);
        this.loading$.next(false);
      }),
      catchError(err => {
        const message = this.extractErrorMessage(err, 'Modification de la salle impossible');
        this.error$.next(message);
        this.loading$.next(false);
        return throwError(() => new Error(message));
      })
    );
  }

  delete(id: number): Observable<void> {
    this.loading$.next(true);
    this.error$.next(null);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.salles$.next(
          this.salles$.value.filter(s => s.id !== id)
        );
        this.loading$.next(false);
      }),
      catchError(err => {
        const message = this.extractErrorMessage(err, 'Suppression de la salle impossible');
        this.error$.next(message);
        this.loading$.next(false);
        return throwError(() => new Error(message));
      })
    );
  }

  private extractErrorMessage(err: any, fallback: string): string {
    const backendMessage =
      typeof err?.error === 'string'
        ? err.error
        : err?.error?.message || err?.message;
    return backendMessage && backendMessage.trim() ? backendMessage : fallback;
  }
}
