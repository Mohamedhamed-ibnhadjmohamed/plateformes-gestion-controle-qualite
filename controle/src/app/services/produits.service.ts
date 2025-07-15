import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProduitsService {
  private baseUrl: string = 'http://127.0.0.1:3000/';

  constructor(private http: HttpClient) {}

  getAllProduits(): Observable<any[]> {
    const url = this.baseUrl + 'produit/all';
    return this.http.get<any[]>(url).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la récupération des produit :",
          error
        );
        throw error;
      })
    );
  }

  getById(id: any): Observable<any> {
    const url = `${this.baseUrl}produit/getid/${id}`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la récupération de produit :",
          error
        );
        return throwError(error);
      })
    );
  }

  createProduit(data: any): Observable<any> {
    const url = `${this.baseUrl}produit/add`;
    return this.http.post<any>(url, data).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la création de produit :",
          error
        );
        throw error;
      })
    );
  }

  updateProduit(id: any, newData: any): Observable<any> {
    const url = `${this.baseUrl}produit/update/${id}`;
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

  deleteProduit(id: any): Observable<any> {
    const url = `${this.baseUrl}produit/delete/${id}`;
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

  getAllById(id: any): Observable<any> {
    const url = `${this.baseUrl}produit/getallid/${id}`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la récupération de produit :",
          error
        );
        return throwError(error);
      })
    );
  }

  getByCode(code: number): Observable<any> {
    // Construction correcte de l'URL avec les backticks pour les templates strings
    const url = `${this.baseUrl}produit/getbycode/${code}`;

    // Affichage de l'URL pour le débogage (peut être supprimé après vérification)


    return this.http.get<any>(url).pipe(
      catchError((error) => {
        // Affichage de l'URL pour le débogage en cas d'erreur (peut être supprimé après vérification)
        console.error(
          "Une erreur s'est produite lors de la récupération du produit :",
          error
        );
      
        return throwError(
          () => new Error('Erreur lors de la récupération du produit.')
        );
      })
    );
  }
}
