import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AqlsService {
  constructor(private http: HttpClient) {}

  // Consider environment variable for flexibility
  private baseUrl: string = 'http://127.0.0.1:3000/'; // Or use a process.env variable

  getAllAql(): Observable<any> {
    // Type any can be refined based on API response
    const url = this.baseUrl + 'aql/all';
    return this.http.get<any>(url); // Specify response type for type safety
  }
  getById(id: any): Observable<any> {
    const url = `${this.baseUrl}aql/getid/${id}`; // Utiliser la bonne URL
    return this.http.get<any>(url);
  }

  createAql(data: any): Observable<any> {
    const url = `${this.baseUrl}aql/add`;
    return this.http.post<any>(url, data);
  }
  updateAql(id: any, newData: any): Observable<any> {
    const url = `${this.baseUrl}aql/update/${id}`;
    return this.http.put<any>(url, newData);
  }

  deleteAql(id: any): Observable<any> {
    const url = `${this.baseUrl}aql/delete/${id}`;
    return this.http.delete<any>(url);
  }

  getByNom(nom: any): Observable<any> {
    const url = `${this.baseUrl}aql/getbynom/${nom}`; // Utiliser la bonne URL
     return this.http.get<any>(url);
  }
}
