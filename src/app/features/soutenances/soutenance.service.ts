import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Soutenance } from './soutenance.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SoutenanceService {

  private apiUrl = `${environment.apiUrl}/soutenances`;

  private soutenances$ = new BehaviorSubject<Soutenance[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  getSoutenances() { return this.soutenances$.asObservable(); }
  getLoading() { return this.loading$.asObservable(); }
  getError() { return this.error$.asObservable(); }

  loadAll(): Observable<Soutenance[]> {
    this.loading$.next(true);
    return this.http.get<Soutenance[]>(this.apiUrl).pipe(
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
    return this.http.get<Soutenance>(`${this.apiUrl}/${id}`);
  }

  create(data: Soutenance): Observable<Soutenance> {
    return this.http.post<Soutenance>(this.apiUrl, data).pipe(
      tap(newItem => {
        this.soutenances$.next([...this.soutenances$.value, newItem]);
      })
    );
  }

  update(id: number, data: Soutenance): Observable<Soutenance> {
    return this.http.put<Soutenance>(`${this.apiUrl}/${id}`, data).pipe(
      tap(updated => {
        const list = this.soutenances$.value.map(s =>
          s.id === id ? updated : s
        );
        this.soutenances$.next(list);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.soutenances$.next(
          this.soutenances$.value.filter(s => s.id !== id)
        );
      })
    );
  }
}