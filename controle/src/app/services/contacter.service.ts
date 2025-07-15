import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ContacterService {
  private baseUrl: string = 'http://127.0.0.1:3000/contact/';

  constructor(private http: HttpClient) {}

  // Récupérer tous les contacts
  getAllContacts(): Observable<any[]> {
    const url = this.baseUrl + 'all';
    return this.http.get<any>(url);
  }

  // Créer un nouveau contact
  createContact(data: any): Observable<any> {
    const url = this.baseUrl + 'add';
    return this.http.post<any>(url, data);
  }

  // Supprimer un contact
  deleteContact(id: any): Observable<any> {
    const url = `${this.baseUrl}delete/${id}`;
    return this.http.delete<any>(url);
  }

  // Récupérer un contact par email
  rechercher(id: string): Observable<any> {
    const url = `${this.baseUrl}rechercher/${id}`;
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Erreur code ${error.status}, message : ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
