import { Component } from '@angular/core';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrl: './information.component.css',
})
export class InformationComponent {
  processSteps = [
    {
      number: '01',
      title: 'Choisir le type de contrôle',
      description:
        'Sélectionnez le type de contrôle souhaité : sous chaîne, fin de chaîne ou audit. Chaque type de contrôle correspond à une étape spécifique de la production.',
      isExpanded: true,
    },
    {
      number: '02',
      title: 'Sélectionner le produit',
      description:
        'Choisissez le produit à contrôler parmi la liste disponible et sélectionnez-le pour passer à l’étape suivante du processus de contrôle qualité.',
    },
    {
      number: '03',
      title: 'Détecter les défauts',
      description:
        'Identifiez et enregistrez les défauts détectés sur la pièce en utilisant le formulaire dédié. Assurez-vous de documenter chaque défaut de manière précise pour garantir un contrôle rigoureux.',
    },
    {
      number: '04',
      title: "Enregistrer l'inspection",
      description:
        'Remplissez le formulaire d\'observation en incluant toutes les informations pertinentes, puis cliquez sur le bouton "Enregistrer" pour finaliser l\'inspection.',
    },
    {
      number: '05',
      title: 'Rédiger un rapport',
      description:
        "Accédez à la page de rapport pour consulter le résultat de l'inspection. Vous pouvez également générer un rapport pour l'imprimer ou le partager avec les équipes concernées.",
    },
  ];

  toggleExpand(step: any): void {
    step.isExpanded = !step.isExpanded;
  }
}