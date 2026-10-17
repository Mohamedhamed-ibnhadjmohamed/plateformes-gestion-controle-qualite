import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Default } from '../models/Default';
import {
  DefaultsResponse,
  MessageResponse,
  UploadResponse,
} from '../models/api';

@Injectable({
  providedIn: 'root',
})
export class DefautsService {
  constructor(private http: HttpClient) {}

  private baseUrl: string = environment.apiUrl;

  getAlldefault(): Observable<DefaultsResponse> {
    const url = this.baseUrl + 'defaults/all';
    return this.http.get<DefaultsResponse>(url);
  }

  getDefaultsByIdInspection(id_inspection: number): Observable<Default[]> {
    const url = `${this.baseUrl}defaults/allidinspection/${id_inspection}`;
    return this.http.get<Default[]>(url);
  }

  getById(id: any): Observable<DefaultsResponse> {
    const url = `${this.baseUrl}defaults/${id}`;
    return this.http.get<DefaultsResponse>(url);
  }

  createdefault(data: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}defaults/add`;
    return this.http.post<MessageResponse>(url, data);
  }

  updatedefault(id: any, newData: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}defaults/update/${id}`;
    return this.http.put<MessageResponse>(url, newData);
  }

  deletedefault(id: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}defaults/delete/${id}`;
    return this.http.delete<MessageResponse>(url);
  }

  uploadImage(image: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', image);

    return this.http.post<UploadResponse>(`${this.baseUrl}defaults/upload`, formData);
  }

  updateIdInspection(): Observable<MessageResponse> {
    const url = `${this.baseUrl}defaults/update-id-inspection`;
    return this.http.put<MessageResponse>(url, {});
  }

  deletedefauts(): Observable<MessageResponse> {
    const url = `${this.baseUrl}defaults/deletedefauts`;
    return this.http.delete<MessageResponse>(url);
  }

  rechercher(id: string): Observable<DefaultsResponse> {
    const url = `${this.baseUrl}defaults/rechercher/${id}`;
    return this.http
      .get<DefaultsResponse>(url)
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
