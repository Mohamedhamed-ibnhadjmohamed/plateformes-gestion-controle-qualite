import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FamilliedefaultService {
  constructor(private http: HttpClient) {}

  // Consider environment variable for flexibility
  private baseUrl: string = 'http://127.0.0.1:3000/'; // Or use a process.env variable

  getAllfamilledefault(): Observable<any> {
    // Type any can be refined based on API response
    const url = this.baseUrl + 'familledefault/all';
    return this.http.get<any>(url); // Specify response type for type safety
  }
  getById(id: any): Observable<any> {
    const url = `${this.baseUrl}familledefault/${id}`;
    return this.http.get<any>(url);
  }

  createfamilledefault(data: any): Observable<any> {
    const url = `${this.baseUrl}familledefault/add`;
    return this.http.post<any>(url, data);
  }
  updatefamilledefault(id: any, newData: any): Observable<any> {
    const url = `${this.baseUrl}familledefault/update/${id}`;
    return this.http.put<any>(url, newData);
  }

  deletefamilledefault(id: any): Observable<any> {
    const url = `${this.baseUrl}familledefault/delete/${id}`;
    return this.http.delete<any>(url);
  }

  rechercher(id: string): Observable<any> {
    // Remplacez 'any' par le bon type si possible
    const url = `${this.baseUrl}familledefault/rechercher/${id}`;
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
