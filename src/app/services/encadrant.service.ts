import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Encadrant } from '../models/encadrant';

@Injectable({
  providedIn: 'root'
})
export class EncadrantService {
  private apiUrl = 'http://localhost:8081/api/encadrants';
  private encadrants$ = new BehaviorSubject<Encadrant[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

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

    return this.http.get<Encadrant[]>(this.apiUrl).pipe(
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

    return this.http.get<Encadrant>(`${this.apiUrl}/${id}`).pipe(
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
    return this.http.get<boolean>(`${this.apiUrl}/exists/${id}`).pipe(
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

    return this.http.post<Encadrant>(this.apiUrl, encadrant).pipe(
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

    return this.http.put<Encadrant>(`${this.apiUrl}/${id}`, encadrant).pipe(
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

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
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
