import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { AnalysesComponent } from './analyses.component';
import { AnalysesUtilisateurService, VueAnalyses } from '../../../services/analyses-utilisateur.service';
import { BarChartComponent } from '../../../shared/charts/bar-chart.component';
import { BarListComponent } from '../../../shared/charts/bar-list.component';
import { DonutChartComponent } from '../../../shared/charts/donut-chart.component';
import { LineChartComponent } from '../../../shared/charts/line-chart.component';
import { StatCardComponent } from '../../../shared/stat-card/stat-card.component';
import { AnalysesUtilisateur, PorteeAnalyses } from '../../../models/Statistiques';

/** Jeu de données représentatif d'un opérateur de contrôle. */
function analyses(): AnalysesUtilisateur {
  return {
    cartes: [
      {
        id: 'inspections',
        libelle: 'Mes inspections',
        valeur: 5,
        legende: '2 ce mois-ci',
        icone: 'fas fa-clipboard-check',
        ton: 'primary',
        lien: '/home/consulter',
      },
      {
        id: 'conformite',
        libelle: 'Mon taux de conformité',
        valeur: 80,
        suffixe: '%',
        legende: '1 inspection refusée',
        icone: 'fas fa-circle-check',
        ton: 'primary',
        progression: 80,
      },
      {
        id: 'defauts',
        libelle: 'Défauts que j\'ai constatés',
        valeur: 4,
        legende: '1 critique · 1 majeure',
        icone: 'fas fa-triangle-exclamation',
        ton: 'danger',
      },
      {
        id: 'indice',
        libelle: 'Indice de qualité',
        valeur: 76,
        suffixe: '/100',
        legende: 'Score de mes contrôles',
        icone: 'fas fa-gauge-high',
        ton: 'success',
        progression: 76,
      },
      {
        id: 'defauts-par-inspection',
        libelle: 'Défauts par inspection',
        valeur: 0.8,
        legende: '2 défauts mineurs',
        icone: 'fas fa-divide',
        ton: 'neutral',
      },
    ],
    defautsParGravite: [
      { libelle: 'Critique', valeur: 1, couleur: '#d92d20' },
      { libelle: 'Majeure', valeur: 1, couleur: '#c77708' },
      { libelle: 'Mineure', valeur: 2, couleur: '#2864dc' },
    ],
    inspectionsParCategorie: [
      { libelle: 'Sous-chaîne', valeur: 3, info: '1 refus' },
      { libelle: 'Fin de chaîne', valeur: 1, info: 'Aucun refus' },
      { libelle: 'Audit', valeur: 1, info: 'Aucun refus' },
    ],
    inspectionsParMois: [
      { libelle: 'janv.', valeur: 1 },
      { libelle: 'févr.', valeur: 2 },
    ],
    resultatsInspection: [
      { libelle: 'Acceptable', valeur: 3, couleur: '#2864dc' },
      { libelle: 'Refusée', valeur: 1, couleur: '#d92d20' },
    ],
    topFamillesDefauts: [{ libelle: 'Couture', valeur: 3, info: '2 constats' }],
    totalInspections: 5,
    inspectionsDuMois: 2,
    inspectionsRefusees: 1,
    tauxConformite: 80,
    totalDefauts: 4,
    inspectionsNonAttribuees: 1,
    aucuneDonnee: false,
  };
}

/** Analyses sans aucune inspection : état vide de la page. */
function analysesVides(): AnalysesUtilisateur {
  return {
    ...analyses(),
    cartes: [],
    defautsParGravite: [],
    inspectionsParCategorie: [],
    inspectionsParMois: [],
    resultatsInspection: [],
    topFamillesDefauts: [],
    totalInspections: 0,
    inspectionsDuMois: 0,
    inspectionsRefusees: 0,
    tauxConformite: 0,
    totalDefauts: 0,
    inspectionsNonAttribuees: 0,
    aucuneDonnee: true,
  };
}

/** Service simulé : la page se contente de consommer des observables. */
function serviceSimule(vue: Partial<VueAnalyses> = {}, portee: PorteeAnalyses = 'moi') {
  return {
    vue$: of({
      analyses: analyses(),
      chargement: false,
      erreur: null,
      echecs: [],
      initial: false,
      ...vue,
    }),
    portee$: of(portee),
    peutVoirTous: portee === 'tous',
    choisirPortee: jasmine.createSpy('choisirPortee'),
    rafraichir: jasmine.createSpy('rafraichir'),
  };
}

/** Boutons de la barre d'actions (périmètre et période). */
function boutonsActions(fixture: ComponentFixture<AnalysesComponent>): HTMLButtonElement[] {
  const element = fixture.nativeElement as HTMLElement;
  // `Array.from` évite de dépendre de `dom.iterable` dans la configuration TS.
  return Array.from(element.querySelectorAll<HTMLButtonElement>('.an-actions .an-segment'));
}

/** Libellés des boutons de la barre d'actions. */
function libelles(fixture: ComponentFixture<AnalysesComponent>): string[] {
  return boutonsActions(fixture).map((bouton) => bouton.textContent?.trim() ?? '');
}

describe('AnalysesComponent', () => {
  let fixture: ComponentFixture<AnalysesComponent>;
  let service: ReturnType<typeof serviceSimule>;

  async function configurer(vue: Partial<VueAnalyses> = {}, portee: PorteeAnalyses = 'moi') {
    service = serviceSimule(vue, portee);

    await TestBed.configureTestingModule({
      declarations: [
        AnalysesComponent,
        StatCardComponent,
        LineChartComponent,
        DonutChartComponent,
        BarChartComponent,
        BarListComponent,
      ],
      imports: [CommonModule, RouterTestingModule],
      providers: [{ provide: AnalysesUtilisateurService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalysesComponent);
    // Deux passes : la première résout l'`async pipe` (composant OnPush).
    fixture.detectChanges();
    fixture.detectChanges();
  }

  afterEach(() => TestBed.resetTestingModule());

  it('affiche les indicateurs et les graphiques des analyses', async () => {
    await configurer();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.tb-titre, .an-titre')?.textContent).toContain('Mes analyses');
    expect(element.querySelectorAll('.an-kpi').length).toBe(5);
    expect(element.querySelector('app-line-chart')).toBeTruthy();
    expect(element.querySelector('app-donut-chart')).toBeTruthy();
    expect(element.querySelector('app-bar-chart')).toBeTruthy();
    expect(element.textContent).toContain('Synthèse');
  });

  it('signale les inspections sans utilisateur rattaché', async () => {
    await configurer();

    const alertes = (fixture.nativeElement as HTMLElement).querySelectorAll('.an-alerte.alert-info');
    expect(alertes.length).toBe(1);
    expect(alertes[0].textContent).toContain('sans utilisateur rattaché');
  });

  it('bascule la période affichée de la courbe', async () => {
    await configurer();

    const sixMois = boutonsActions(fixture).find((bouton) => bouton.textContent?.trim() === '6 mois');
    sixMois?.click();
    fixture.detectChanges();

    expect(sixMois?.classList).toContain('actif');
    expect(libelles(fixture)).toContain('12 mois');
  });

  it('propose le périmètre « toute l\'équipe » aux administrateurs', async () => {
    await configurer({}, 'tous');

    expect(libelles(fixture)).toEqual(['Mes analyses', 'Toute l\'équipe', '6 mois', '12 mois']);

    boutonsActions(fixture)[1].click();
    expect(service.choisirPortee).toHaveBeenCalledWith('tous');
  });

  it('n\'affiche pas le sélecteur de périmètre pour un opérateur', async () => {
    await configurer();

    expect(libelles(fixture)).toEqual(['6 mois', '12 mois']);
  });

  it('relance le chargement des analyses à la demande', async () => {
    await configurer();

    const bouton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.an-bouton');
    bouton?.click();

    expect(service.rafraichir).toHaveBeenCalled();
  });

  it('affiche un état vide invitant à saisir un contrôle', async () => {
    await configurer({ analyses: analysesVides() });

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.an-vide')).toBeTruthy();
    expect(element.querySelector('.an-vide')?.textContent).toContain('Aucune analyse pour le moment');
    expect(element.querySelectorAll('.an-kpi').length).toBe(0);
  });

  it('signale les collections qui n\'ont pas pu être chargées', async () => {
    await configurer({ echecs: ['defaults'] });

    const alerte = (fixture.nativeElement as HTMLElement).querySelector('.an-alerte.alert-warning');
    expect(alerte?.textContent).toContain('defaults');
  });
});
