import { Component, OnInit } from '@angular/core';
import { Inspection } from '../../../models/Inspection';
import { InspectionsService } from '../../../services/inspections.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.css'],
})
export class ConsultationComponent implements OnInit {
  name: string = 'Inspection';
  inspection: Inspection = new Inspection();
  inspections: Inspection[] = [];
  idUtilisateur: number | null = null;
  parentMessage: string = '';

  constructor(
    private inspectionService: InspectionsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserAndInspections();
  }

  loadUserAndInspections(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser).utilisateur;
      this.idUtilisateur = user.id_utilisateur;
      this.getAllInspections();
    } else {
      this.redirectToLogin();
    }
  }

  redirectToLogin(): void {}

  getAllInspections(): void {
    this.inspectionService.getAllinspection().subscribe(
      (response: any) => {
        if (response.inspections && Array.isArray(response.inspections)) {
          this.inspections = response.inspections;
        } else {
          console.error(
            "La réponse ne contient pas de tableau 'inspections' valide :",
            response
          );
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données :', error);
      }
    );
  }

  confirmer(inspection: Inspection): void {
    this.inspection = inspection;
  }

  supprimer(inspection: Inspection): void {
    this.inspectionService.deleteinspection(inspection.id_inspection).subscribe(
      (response: any) => {
        this.inspections = this.inspections.filter(
          (item) => item.id_inspection !== inspection.id_inspection
        );
        console.log("L'élément a été supprimé avec succès :", response);
      },
      (error: any) => {
        console.error("Erreur lors de la suppression de l'élément :", error);
      }
    );
  }

  consulter(idInspection: any): void {
 this.router.navigate(['/home/pdf', idInspection]);  }
  consulterimprimer(idInspection: number | undefined) {
    window.open(`/home/pdfimprimer/${idInspection}`, '_blank');
  }
}
