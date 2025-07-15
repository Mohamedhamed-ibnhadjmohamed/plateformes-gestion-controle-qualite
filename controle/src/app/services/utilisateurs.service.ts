import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UtilisateursService {
  private baseUrl: string = 'http://127.0.0.1:3000/';
  constructor(private http: HttpClient) {}

  getAllUtilisateurs(): Observable<any[]> {
    const url = `${this.baseUrl}utilisateur/all`;
    return this.http.get<any[]>(url);
  }

  getById(id: number): Observable<any> {
    const url = `${this.baseUrl}utilisateur/${id}`;
    return this.http.get<any>(url);
  }
  getByName(nom: String): Observable<any> {
    const url = `${this.baseUrl}utilisateur/${nom}`;
    return this.http.get<any>(url);
  }

  createUtilisateur(data: any): Observable<any> {
    const url = `${this.baseUrl}utilisateur/add`;
    return this.http.post<any>(url, data);
  }

  updateUtilisateur(id: number, newData: any): Observable<any> {
    const url = `${this.baseUrl}utilisateur/update/${id}`;
    return this.http.put<any>(url, newData);
  }

  deleteUtilisateur(id: any): Observable<any> {
    const url = `${this.baseUrl}utilisateur/delete/${id}`;
    return this.http.delete<any>(url);
  }
  findByEmailAndPassword(data: {
    email: string;
    password: string;
  }): Observable<any[]> {
    const url = `${this.baseUrl}utilisateur/login/${data.email}/${data.password}`;
    return this.http.get<any[]>(url);
  }

  islogin() {
    let token = localStorage.getItem('user');
    if (token) {
      return true;
    } else return false;
  }

  rechercher(id: string): Observable<any> {
    const url = `${this.baseUrl}utilisateur/rechercher/${id}`;
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
