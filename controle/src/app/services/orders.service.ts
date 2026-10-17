import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  MessageResponse,
  OrdersResponse,
  RapprochementResponse,
  SuiviQuantiteResponse,
} from '../models/api';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getUrl(endpoint: string): string {
    return `${this.baseUrl}order/${endpoint}`;
  }

  getAllordersFabrication(): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(this.getUrl('all'));
  }

  getorderFabricationById(id: string): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(this.getUrl(id));
  }

  addorderFabrication(order: any): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(this.getUrl('add'), order);
  }

  updateorderFabrication(id: any, order: any): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(this.getUrl(`update/${id}`), order);
  }

  deleteorderFabrication(id: any): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(this.getUrl(`delete/${id}`));
  }

  getOrderByLibelle(libelle_order: any): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(
      this.getUrl(`getbylibelle/${libelle_order}`)
    );
  }

  /** Rapport de rapprochement des quantités (admin). */
  getRapprochement(): Observable<RapprochementResponse> {
    return this.http.get<RapprochementResponse>(this.getUrl('rapprochement'));
  }

  /**
   * Quantité commandée / enregistrée / restante pour un OF.
   * `exclureIdProduit` ignore un produit existant lors d'une mise à jour.
   */
  getSuiviQuantite(
    idOrder: number | string,
    exclureIdProduit?: number
  ): Observable<SuiviQuantiteResponse> {
    let params = new HttpParams();
    if (exclureIdProduit != null) {
      params = params.set('exclure', String(exclureIdProduit));
    }
    return this.http.get<SuiviQuantiteResponse>(
      this.getUrl(`${idOrder}/suivi-quantite`),
      { params }
    );
  }
}
