import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  idUtilisateur: number | null = null;
  email: string = '';
  motDePasse: string = '';
  nom: string = '';
  prenom: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser).utilisateur;

      // Déstructurer l'objet utilisateur pour extraire chaque attribut dans une variable
      const { id_utilisateur, email, mot_de_passe, nom, prenom } = user;

      // Assigner chaque attribut à une variable
      this.idUtilisateur = id_utilisateur;
      this.email = email;
      this.motDePasse = mot_de_passe;
      this.nom = nom;
      this.prenom = prenom;

      // Affichage des valeurs dans la console (optionnel)
      //console.log('ID:', this.idUtilisateur);
      // console.log('Email:', this.email);
      // console.log('Mot de passe:', this.motDePasse); // Notez que pour des raisons de sécurité, il est préférable de ne pas afficher les mots de passe
      // console.log('Nom:', this.nom);
      // console.log('Prénom:', this.prenom);
    } else {
      this.redirectToLogin();
    }
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }


  logout(): void {
    localStorage.removeItem('user');

    // Redirection vers la page de connexion
    this.redirectToLogin();
  }
}

