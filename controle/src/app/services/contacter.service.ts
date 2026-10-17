import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ContactsResponse, MessageResponse } from '../models/api';

@Injectable({
  providedIn: 'root',
})
export class ContacterService {
  private baseUrl: string = `${environment.apiUrl}contact/`;

  constructor(private http: HttpClient) {}

  // Récupérer tous les contacts
  getAllContacts(): Observable<ContactsResponse> {
    const url = this.baseUrl + 'all';
    return this.http.get<ContactsResponse>(url);
  }

  // Créer un nouveau contact
  createContact(data: any): Observable<MessageResponse> {
    const url = this.baseUrl + 'add';
    return this.http.post<MessageResponse>(url, data);
  }

  // Supprimer un contact
  deleteContact(id: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}delete/${id}`;
    return this.http.delete<MessageResponse>(url);
  }

  // Récupérer un contact par email
  rechercher(id: string): Observable<ContactsResponse> {
    const url = `${this.baseUrl}rechercher/${id}`;
    return this.http
      .get<ContactsResponse>(url)
      .pipe(catchError(this.handleError));
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
