import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { InspectionsResponse, MessageResponse } from '../models/api';

@Injectable({
  providedIn: 'root',
})
export class InspectionsService {
  constructor(private http: HttpClient) {}

  private baseUrl: string = environment.apiUrl;

  getAllinspection(): Observable<InspectionsResponse> {
    const url = this.baseUrl + 'inspection/all';
    return this.http.get<InspectionsResponse>(url);
  }

  getById(id: any): Observable<InspectionsResponse> {
    const url = `${this.baseUrl}inspection/${id}`;
    return this.http.get<InspectionsResponse>(url);
  }

  getMaxId(): Observable<number> {
    const url = this.baseUrl + 'inspection/max';
    return this.http.get<number>(url);
  }

  createinspection(data: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}inspection/add`;
    return this.http.post<MessageResponse>(url, data);
  }

  updateinspection(id: any, newData: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}inspection/update/${id}`;
    return this.http.put<MessageResponse>(url, newData);
  }

  deleteinspection(id: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}inspection/delete/${id}`;
    return this.http.delete<MessageResponse>(url);
  }

  getConsultation(id: any): Observable<InspectionsResponse> {
    const url = `${this.baseUrl}inspection/consultation/${id}`;
    return this.http.get<InspectionsResponse>(url);
  }

  rechercher(id: string): Observable<InspectionsResponse> {
    const url = `${this.baseUrl}inspection/rechercher/${id}`;
    return this.http
      .get<InspectionsResponse>(url)
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
