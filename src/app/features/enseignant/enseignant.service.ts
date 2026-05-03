import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Enseignant } from './enseignant.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnseignantService {

  private apiUrl = `${environment.apiUrl}/enseignants`;

  private enseignants$ = new BehaviorSubject<Enseignant[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

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

    return this.http.get<Enseignant[]>(this.apiUrl).pipe(
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
    return this.http.get<Enseignant>(`${this.apiUrl}/${id}`);
  }

  create(data: Enseignant): Observable<Enseignant> {
    return this.http.post<Enseignant>(this.apiUrl, data).pipe(
      tap(newItem => {
        this.enseignants$.next([...this.enseignants$.value, newItem]);
      })
    );
  }

  update(id: number, data: Enseignant): Observable<Enseignant> {
    return this.http.put<Enseignant>(`${this.apiUrl}/${id}`, data).pipe(
      tap(updated => {
        const list = this.enseignants$.value.map(e =>
          e.id === id ? updated : e
        );
        this.enseignants$.next(list);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.enseignants$.next(
          this.enseignants$.value.filter(e => e.id !== id)
        );
      })
    );
  }
}