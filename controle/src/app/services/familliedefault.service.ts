import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { FamillesResponse, MessageResponse } from '../models/api';

@Injectable({
  providedIn: 'root',
})
export class FamilliedefaultService {
  constructor(private http: HttpClient) {}

  private baseUrl: string = environment.apiUrl;

  getAllfamilledefault(): Observable<FamillesResponse> {
    const url = this.baseUrl + 'familledefault/all';
    return this.http.get<FamillesResponse>(url);
  }

  getById(id: any): Observable<FamillesResponse> {
    const url = `${this.baseUrl}familledefault/${id}`;
    return this.http.get<FamillesResponse>(url);
  }

  createfamilledefault(data: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}familledefault/add`;
    return this.http.post<MessageResponse>(url, data);
  }

  updatefamilledefault(id: any, newData: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}familledefault/update/${id}`;
    return this.http.put<MessageResponse>(url, newData);
  }

  deletefamilledefault(id: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}familledefault/delete/${id}`;
    return this.http.delete<MessageResponse>(url);
  }

  rechercher(id: string): Observable<FamillesResponse> {
    const url = `${this.baseUrl}familledefault/rechercher/${id}`;
    return this.http
      .get<FamillesResponse>(url)
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
