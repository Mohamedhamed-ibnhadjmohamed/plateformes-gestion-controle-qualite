import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AllProduit } from '../models/AllProduit';
import { Produit } from '../models/Produit';
import {
  MessageResponse,
  ProduitsResponse,
} from '../models/api';

@Injectable({
  providedIn: 'root',
})
export class ProduitsService {
  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllProduits(): Observable<ProduitsResponse> {
    const url = this.baseUrl + 'produit/all';
    return this.http.get<ProduitsResponse>(url).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la récupération des produit :",
          error
        );
        throw error;
      })
    );
  }

  getById(id: any): Observable<Produit> {
    const url = `${this.baseUrl}produit/getid/${id}`;
    return this.http.get<Produit>(url).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la récupération de produit :",
          error
        );
        return throwError(error);
      })
    );
  }

  createProduit(data: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}produit/add`;
    return this.http.post<MessageResponse>(url, data).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la création de produit :",
          error
        );
        throw error;
      })
    );
  }

  updateProduit(id: any, newData: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}produit/update/${id}`;
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

  deleteProduit(id: any): Observable<MessageResponse> {
    const url = `${this.baseUrl}produit/delete/${id}`;
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

  getAllById(id: any): Observable<AllProduit[]> {
    const url = `${this.baseUrl}produit/getallid/${id}`;
    return this.http.get<AllProduit[]>(url).pipe(
      catchError((error) => {
        console.error(
          "Une erreur s'est produite lors de la récupération de produit :",
          error
        );
        return throwError(error);
      })
    );
  }

  getByCode(code: number): Observable<ProduitsResponse> {
    // Construction correcte de l'URL avec les backticks pour les templates strings
    const url = `${this.baseUrl}produit/getbycode/${code}`;

    return this.http.get<ProduitsResponse>(url).pipe(
      catchError((error) => {
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
