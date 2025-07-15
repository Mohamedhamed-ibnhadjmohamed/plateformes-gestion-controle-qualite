import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private baseUrl: string = 'http://127.0.0.1:3000/';

  constructor(private http: HttpClient) {}

  private getUrl(endpoint: string): string {
    return `${this.baseUrl}order/${endpoint}`;
  }

  getAllordersFabrication(): Observable<any> {
    return this.http.get<any>(this.getUrl('all'));
  }

  getorderFabricationById(id: string): Observable<any> {
    return this.http.get<any>(this.getUrl(id));
  }

  addorderFabrication(order: any): Observable<any> {
    return this.http.post<any>(this.getUrl('add'), order);
  }

  updateorderFabrication(id: any, order: any): Observable<any> {
    return this.http.put<any>(this.getUrl(`update/${id}`), order);
  }

  deleteorderFabrication(id: any): Observable<any> {
    return this.http.delete<any>(this.getUrl(`delete/${id}`));
  }

  getOrderByLibelle(libelle_order: any): Observable<any> {
  alert(this.getUrl(`getbylibelle/${libelle_order}`));
    return this.http.get<any>(this.getUrl(`getbylibelle/${libelle_order}`));
  }
}
