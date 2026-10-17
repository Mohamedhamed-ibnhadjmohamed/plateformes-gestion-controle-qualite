import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { Inspection } from '../../../models/Inspection';
import { InspectionsService } from '../../../services/inspections.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/login/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-consultation',
    templateUrl: './consultation.component.html',
    styleUrls: ['./consultation.component.css'],
    standalone: false
})
export class ConsultationComponent implements OnInit {
  protected readonly destroyRef = inject(DestroyRef);
  name: string = 'Inspection';
  inspection: Inspection = new Inspection();
  inspections: Inspection[] = [];
  idUtilisateur: number | null = null;
  parentMessage: string = '';

  constructor(
    private inspectionService: InspectionsService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserAndInspections();
  }

  loadUserAndInspections(): void {
    const user = this.authService.getUser();
    if (user) {
      this.idUtilisateur = user.id_utilisateur ?? null;
      this.getAllInspections();
    } else {
      this.redirectToLogin();
    }
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  getAllInspections(): void {
    this.inspectionService.getAllinspection().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
        console.error('Erreur lors de la récupération des données.', error);
      }
    );
  }

  confirmer(inspection: Inspection): void {
    this.inspection = inspection;
  }

  supprimer(inspection: Inspection): void {
    this.inspectionService.deleteinspection(inspection.id_inspection).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        this.inspections = this.inspections.filter(
          (item) => item.id_inspection !== inspection.id_inspection
        );
      },
      (error: any) => {
        console.error("Erreur lors de la suppression de l'utilisateur.", error);
      }
    );
  }

  consulter(idInspection: any): void {
 this.router.navigate(['/home/pdf', idInspection]);  }
  consulterimprimer(idInspection: number | undefined) {
    window.open(`/home/pdfimprimer/${idInspection}`, '_blank');
  }
}
