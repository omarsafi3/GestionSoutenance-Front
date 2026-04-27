import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Etudiant } from '../models/etudiant';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EtudiantService {
  private readonly apiUrl = `${environment.apiUrl}/etudiants`;
  
  // État centralisé
  private etudiants$ = new BehaviorSubject<Etudiant[]>([]);
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

  // Observables pour les abonnements
  getEtudiants(): Observable<Etudiant[]> {
    return this.etudiants$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  getError(): Observable<string | null> {
    return this.error$.asObservable();
  }

  // Charger tous les étudiants
  loadAll(): Observable<Etudiant[]> {
    this.loading$.next(true);
    this.error$.next(null);
    
    return this.http.get<Etudiant[]>(this.apiUrl).pipe(
      tap(data => {
        this.etudiants$.next(data);
        this.loading$.next(false);
      }),
      catchError(err => {
        const errorMsg = this.extractErrorMessage(err, 'Erreur lors du chargement des étudiants');
        this.error$.next(errorMsg);
        this.loading$.next(false);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  getById(id: number): Observable<Etudiant> {
    this.loading$.next(true);
    this.error$.next(null);
    
    return this.http.get<Etudiant>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loading$.next(false)),
      catchError(err => {
        const errorMsg = this.extractErrorMessage(err, 'Erreur lors du chargement de l\'étudiant');
        this.error$.next(errorMsg);
        this.loading$.next(false);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  exists(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${id}`).pipe(
      catchError(err => {
        const errorMsg = this.extractErrorMessage(err, 'Erreur lors de la verification de l etudiant');
        this.error$.next(errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  create(etudiant: Etudiant): Observable<Etudiant> {
    this.loading$.next(true);
    this.error$.next(null);
    
    return this.http.post<Etudiant>(this.apiUrl, etudiant).pipe(
      tap(newEtudiant => {
        const current = this.etudiants$.value;
        this.etudiants$.next([...current, newEtudiant]);
        this.loading$.next(false);
      }),
      catchError(err => {
        const errorMsg = this.extractErrorMessage(err, 'Erreur lors de la création de l\'étudiant');
        this.error$.next(errorMsg);
        this.loading$.next(false);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  update(id: number, etudiant: Etudiant): Observable<Etudiant> {
    this.loading$.next(true);
    this.error$.next(null);
    
    return this.http.put<Etudiant>(`${this.apiUrl}/${id}`, etudiant).pipe(
      tap(updatedEtudiant => {
        const current = this.etudiants$.value;
        const index = current.findIndex(e => e.id === id);
        if (index !== -1) {
          current[index] = updatedEtudiant;
          this.etudiants$.next([...current]);
        }
        this.loading$.next(false);
      }),
      catchError(err => {
        const errorMsg = this.extractErrorMessage(err, 'Erreur lors de la modification de l\'étudiant');
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
        const current = this.etudiants$.value;
        this.etudiants$.next(current.filter(e => e.id !== id));
        this.loading$.next(false);
      }),
      catchError(err => {
        const errorMsg = this.extractErrorMessage(err, 'Erreur lors de la suppression de l\'étudiant');
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
