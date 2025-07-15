import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: any;

  constructor() {
  }

  setUser(user: any) {
    this.user = user;
    console.log('Utilisateur stocké :', user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): any {
    return this.user;
  }

  isLoggedIn(): boolean {
    const user = this.getUser();
    console.log('isLoggedIn check user:', user);
    return !!user && !!user.email;
  }

  logout() {
    this.user = null;
    localStorage.removeItem('user');
  }
}
