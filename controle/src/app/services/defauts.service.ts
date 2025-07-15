import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DefautsService {
  static updateIdInspection(idInspection: any, updatedData: any) {
    throw new Error('Method not implemented.');
  }
  constructor(private http: HttpClient) {}

  // Consider environment variable for flexibility
  private baseUrl: string = 'http://127.0.0.1:3000/'; // Or use a process.env variable

  getAlldefault(): Observable<any> {
    // Type any can be refined based on API response
    const url = this.baseUrl + 'defaults/all';
    return this.http.get<any>(url); // Specify response type for type safety
  }

  getDefaultsByIdInspection(id_inspection: number): Observable<any> {
    const url = `${this.baseUrl}defaults/allidinspection/${id_inspection}`;
    return this.http.get<any>(url);
  }

  getById(id: any): Observable<any> {
    const url = `${this.baseUrl}defaults/${id}`;
    return this.http.get<any>(url);
  }

  createdefault(data: any): Observable<any> {
    const url = `${this.baseUrl}defaults/add`;
    return this.http.post<any>(url, data);
  }
  updatedefault(id: any, newData: any): Observable<any> {
    const url = `${this.baseUrl}defaults/update/${id}`;
    return this.http.put<any>(url, newData);
  }

  deletedefault(id: any): Observable<any> {
    const url = `${this.baseUrl}defaults/delete/${id}`;
    return this.http.delete<any>(url);
  }

  uploadImage(image: File) {
    const formData = new FormData();
    formData.append('image', image);

    return this.http.post<any>('defaults/upload', formData);
  }

  updateIdInspection(): Observable<any> {
    const url = `${this.baseUrl}defaults/update-id-inspection`;
    return this.http.put<any>(url, {});
  }

  deletedefauts(): Observable<any> {
    const url = `${this.baseUrl}defaults/deletedefauts`;
    return this.http.delete<any>(url);
  }

  rechercher(id: string): Observable<any> {
    const url = `${this.baseUrl}defaults/rechercher/${id}`;
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


