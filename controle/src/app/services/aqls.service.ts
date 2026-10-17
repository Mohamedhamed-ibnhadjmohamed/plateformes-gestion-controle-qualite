import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AqlResponse, AqlsResponse, MessageResponse } from '../models/api';

@Injectable({
  providedIn: 'root',
})
export class AqlsService {
  constructor(private http: HttpClient) {}

  private baseUrl: string = environment.apiUrl;

  getAllAql(): Observable<AqlsResponse> {
    return this.http.get<AqlsResponse>(`${this.baseUrl}aql/all`);
  }

  getById(id: any): Observable<AqlResponse> {
    return this.http.get<AqlResponse>(`${this.baseUrl}aql/getid/${id}`);
  }

  createAql(data: any): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}aql/add`, data);
  }

  updateAql(id: any, newData: any): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(
      `${this.baseUrl}aql/update/${id}`,
      newData
    );
  }

  deleteAql(id: any): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}aql/delete/${id}`);
  }

  getByNom(nom: any): Observable<AqlsResponse> {
    return this.http.get<AqlsResponse>(`${this.baseUrl}aql/getbynom/${nom}`);
  }
}
