import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Utilisateur } from '../models/Utilisateur';
import { environment } from '../../environments/environment';
import {
  LoginResponse,
  MessageResponse,
  UtilisateursResponse,
} from '../models/api';

@Injectable({
  providedIn: 'root',
})
export class UtilisateursService {
  private baseUrl: string = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAllUtilisateurs(): Observable<UtilisateursResponse> {
    const url = `${this.baseUrl}utilisateur/all`;
    return this.http.get<UtilisateursResponse>(url);
  }

  getById(id: number): Observable<UtilisateursResponse> {
    const url = `${this.baseUrl}utilisateur/${id}`;
    return this.http.get<UtilisateursResponse>(url);
  }

  getByName(nom: string): Observable<UtilisateursResponse> {
    const url = `${this.baseUrl}utilisateur/${nom}`;
    return this.http.get<UtilisateursResponse>(url);
  }

  createUtilisateur(data: any): Observable<MessageResponse<Utilisateur>> {
    const url = `${this.baseUrl}utilisateur/add`;
    return this.http.post<MessageResponse<Utilisateur>>(url, data);
  }

  updateUtilisateur(id: number, newData: any): Observable<MessageResponse<Utilisateur>> {
    const url = `${this.baseUrl}utilisateur/update/${id}`;
    return this.http.put<MessageResponse<Utilisateur>>(url, newData);
  }

  deleteUtilisateur(id: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}utilisateur/delete/${id}`;
    return this.http.delete<MessageResponse>(url);
  }

  login(data: {
    email: string;
    password: string;
  }): Observable<LoginResponse> {
    const url = `${this.baseUrl}utilisateur/login`;
    return this.http.post<LoginResponse>(url, data);
  }

  rechercher(id: string): Observable<UtilisateursResponse> {
    const url = `${this.baseUrl}utilisateur/rechercher/${id}`;
    return this.http
      .get<UtilisateursResponse>(url)
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
