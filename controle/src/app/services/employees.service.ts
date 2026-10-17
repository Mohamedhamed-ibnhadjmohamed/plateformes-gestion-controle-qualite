import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { EmployeesResponse, MessageResponse } from '../models/api';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllEmployees(): Observable<EmployeesResponse> {
    const url = this.baseUrl + 'employee/all';
    return this.http.get<EmployeesResponse>(url).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la récupération des employés :",
          error
        );
        throw error;
      })
    );
  }

  getById(id: any): Observable<EmployeesResponse> {
    const url = `${this.baseUrl}employee/${id}`;
    return this.http.get<EmployeesResponse>(url).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la récupération de l'employé :",
          error
        );
        throw error;
      })
    );
  }

  createEmployee(data: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}employee/add`;
    return this.http.post<MessageResponse>(url, data).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la création de l'employé :",
          error
        );
        throw error;
      })
    );
  }

  updateEmployee(id: any, newData: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}employee/update/${id}`;
    return this.http.put<MessageResponse>(url, newData).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la mise à jour de l'employé :",
          error
        );
        throw error;
      })
    );
  }

  deleteEmployee(id: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}employee/delete/${id}`;
    return this.http.delete<MessageResponse>(url).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la suppression de l'employé :",
          error
        );
        throw error;
      })
    );
  }

  rechercher(id: string): Observable<EmployeesResponse> {
    const url = `${this.baseUrl}employee/rechercher/${id}`;
    return this.http
      .get<EmployeesResponse>(url)
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
