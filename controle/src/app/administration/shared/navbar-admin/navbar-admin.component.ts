import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Optional: Define an interface for the user object
interface Utilisateur {
  id_utilisateur: number;
  email: string;
  mot_de_passe: string;
  nom: string;
  prenom: string;
}

@Component({
  selector: 'app-navbar-admin',
  templateUrl: './navbar-admin.component.html',
  styleUrls: ['./navbar-admin.component.css']  // Corrected typo here
})
export class NavbarAdminComponent implements OnInit {
  idUtilisateur: number | null = null;
  email: string = '';
  motDePasse: string = '';  // Consider not storing plain text passwords like this
  nom: string = '';
  prenom: string = '';

  constructor(private router: Router) {}
 
  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user: Utilisateur = JSON.parse(storedUser).utilisateur;
      const { id_utilisateur, email, mot_de_passe, nom, prenom } = user;
      this.idUtilisateur = id_utilisateur;
      this.email = email;
      this.motDePasse = mot_de_passe;  
      this.nom = nom;
      this.prenom = prenom;

    } else {
      this.redirectToLogin();
    }
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    localStorage.removeItem('user');
    this.redirectToLogin();
  }
}
