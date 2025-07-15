import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InspectionsService } from '../../../../services/inspections.service';
import { DefautsService } from '../../../../services/defauts.service';
import { FamilliedefaultService } from '../../../../services/familliedefault.service';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.css'],
})
export class PdfComponent implements OnInit {
  idInspection: any; // Stocker l'ID de l'inspection récupérée
  inspectionData: any; // Variable pour stocker les données d'inspection récupérées
  defaults: any[] = [];
  familledefaults: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private inspectionsService: InspectionsService,
    private defaultservice: DefautsService,
    private famillesdefaultservice: FamilliedefaultService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.idInspection = params.get('id'); // Récupération du paramètre idInspection
      if (this.idInspection) {
        console.log('ID Inspection:', this.idInspection);
        this.loadPdf(this.idInspection); // Charger le PDF
        this.getDefaultsByIdInspection(this.idInspection);
      }
    });
    this.getAllfamilledefault();
  }

  loadPdf(id: string): void {
    this.inspectionsService.getConsultation(id).subscribe(
      (response: any) => {
        this.inspectionData = response.inspections;
        console.log("Données d'inspection récupérées :", this.inspectionData);
      },
      (error: any) => {
        console.error(
          "Erreur lors de la récupération des données d'inspection :",
          error
        );
      }
    );
  }

  getDefaultsByIdInspection(id: number): void {
    this.defaultservice.getDefaultsByIdInspection(id).subscribe(
      (response: any) => {
        if (response && Array.isArray(response)) {
          this.defaults = response;
          console.log('Defaults:', this.defaults);
        } else {
          console.error(
            'La réponse du service ne contient pas de tableau valide :',
            response
          );
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données :', error);
        // Traiter les erreurs de requête ici
      }
    );
  }
  getAllfamilledefault(): void {
    this.famillesdefaultservice.getAllfamilledefault().subscribe(
      (response: any) => {
        if (response && response.familles && Array.isArray(response.familles)) {
          // Utiliser la clé 'familles' au lieu de 'familledefault'
          this.familledefaults = response.familles; // Utiliser 'familles' au lieu de 'familledefault'
          //alert(JSON.stringify(this.familledefaults));
        } else {
          console.error(
            'La réponse du service ne contient pas de tableau familledefaults valide :',
            response
          );
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données :', error);
      }
    );
  }

 imprimer() {
  const printContent = document.getElementById('imprimerpartie');
  const WindowPrt = window.open(
    '',
    '',
    'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0'
  );

  if (printContent && WindowPrt) {
    WindowPrt.document.open();
    WindowPrt.document.write(`
      <html>
      <head>
        <title>Fiche d’Évaluation de Contrôle de Qualité</title>
        <style>
          /* A4 page layout */
          .a4-container {
            width: 210mm;
            height: 297mm;
            padding: 20mm;
            margin: 10mm auto;
            border: 1px solid #ccc;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
            background: white;
            font-size: 12pt;
            font-family: 'Times New Roman', Times, serif;
            position: relative;
          }

          .card {
            page-break-inside: avoid;
          }

          h4 {
            margin-top: 50px;
            text-align: center;
          }

          p {
            font-size: 16px;
            font-family: 'Times New Roman', Times, serif;
          }

          p::first-letter {
            padding-left: 20px;
          }

          /* Header and Footer */
          .header, .footer {
            position: fixed;
            width: 100%;
            left: 0;
            background-color: #f1f1f1;
            text-align: center;
            padding: 10px 0;
            font-size: 12pt;
            font-family: 'Times New Roman', Times, serif;
          }

          .header {
            top: 0;
          }

          .footer {
            bottom: 0;
          }

          .page-number:after {
            content: counter(page);
          }

          /* Print-specific styles */
          @media print {
            body {
              margin: 0;
            }
            .a4-container {
              box-shadow: none;
              margin: 0;
              padding: 0;
              border: none;
            }

            .header, .footer {
              display: block;
            }
          }

          .table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .table, .table th, .table td {
            border: 1px solid black;
          }
          
          .table th, .table td {
            padding: 8px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">Fiche de Contrôle </div>
        <div class="a4-container">
          ${printContent.innerHTML}
        </div>
        <div class="footer">QualityMaster - &copy; - Tous droits réservés. <span class="page-number"></span></div>
      </body>
    </html>
    `);
    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.print();
    WindowPrt.close();
  }
}



}
