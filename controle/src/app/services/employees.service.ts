import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private baseUrl: string = 'http://127.0.0.1:3000/';

  constructor(private http: HttpClient) {}

  getAllEmployees(): Observable<any[]> {
    const url = this.baseUrl + 'employee/all';
    return this.http.get<any[]>(url).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la récupération des employés :",
          error
        );
        throw error;
      })
    );
  }

  getById(id: any): Observable<any> {
    const url = `${this.baseUrl}employee/${id}`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la récupération de l'employé :",
          error
        );
        throw error;
      })
    );
  }

  createEmployee(data: any): Observable<any> {
    const url = `${this.baseUrl}employee/add`;
    return this.http.post<any>(url, data).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la création de l'employé :",
          error
        );
        throw error;
      })
    );
  }

  updateEmployee(id: any, newData: any): Observable<any> {
    const url = `${this.baseUrl}employee/update/${id}`;
    return this.http.put<any>(url, newData).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la mise à jour de l'employé :",
          error
        );
        throw error;
      })
    );
  }

  deleteEmployee(id: any): Observable<any> {
    const url = `${this.baseUrl}employee/delete/${id}`;
    return this.http.delete<any>(url).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la suppression de l'employé :",
          error
        );
        throw error;
      })
    );
  }

  rechercher(id: string): Observable<any> {
    // Remplacez 'any' par le bon type si possible
    const url = `${this.baseUrl}employee/rechercher/${id}`;
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
