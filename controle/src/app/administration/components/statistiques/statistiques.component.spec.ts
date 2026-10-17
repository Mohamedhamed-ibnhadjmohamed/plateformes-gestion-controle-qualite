import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { StatistiquesComponent } from './statistiques.component';
import { StatistiquesService, VueDashboard } from '../../../services/statistiques.service';
import { BarChartComponent } from '../../../shared/charts/bar-chart.component';
import { BarListComponent } from '../../../shared/charts/bar-list.component';
import { DonutChartComponent } from '../../../shared/charts/donut-chart.component';
import { LineChartComponent } from '../../../shared/charts/line-chart.component';
import { StatCardComponent } from '../../../shared/stat-card/stat-card.component';
import { StatistiquesDashboard } from '../../../models/Statistiques';

/** Jeu de données représentatif du tableau de bord administrateur. */
function statistiques(): StatistiquesDashboard {
  return {
    cartes: [
      {
        id: 'inspections',
        libelle: 'Inspections réalisées',
        valeur: 12,
        legende: '3 ce mois-ci',
        icone: 'fas fa-clipboard-check',
        ton: 'primary',
        lien: '/admin/inspection',
      },
      {
        id: 'conformite',
        libelle: 'Taux de conformité',
        valeur: 83,
        suffixe: '%',
        legende: '2 inspections refusées',
        icone: 'fas fa-circle-check',
        ton: 'success',
        progression: 83,
      },
    ],
    defautsParGravite: [
      { libelle: 'Critique', valeur: 2, couleur: '#d92d20' },
      { libelle: 'Majeure', valeur: 4, couleur: '#c77708' },
      { libelle: 'Mineure', valeur: 6, couleur: '#2864dc' },
    ],
    inspectionsParCategorie: [
      { libelle: 'Sous-chaîne', valeur: 7, info: '1 refus' },
      { libelle: 'Fin de chaîne', valeur: 3, info: 'Aucun refus' },
      { libelle: 'Audit', valeur: 2, info: '1 refus' },
    ],
    inspectionsParMois: [
      { libelle: 'janv.', valeur: 2 },
      { libelle: 'févr.', valeur: 3 },
    ],
    resultatsInspection: [
      { libelle: 'Excellente', valeur: 4, couleur: '#159a68' },
      { libelle: 'Refusée', valeur: 2, couleur: '#d92d20' },
    ],
    topFamillesDefauts: [{ libelle: 'Couture', valeur: 5, info: '3 constats' }],
    ressources: [{ libelle: 'Familles de défauts', valeur: 4 }],
    indiceQualite: 81,
    tauxConformite: 83,
    totalDefauts: 12,
    totalInspections: 12,
    inspectionsDuMois: 3,
    inspectionsRefusees: 2,
    quantiteDemandee: 500,
    quantiteProduite: 480,
    aucuneDonnee: false,
  };
}

/** Service simulé : la page se contente de consommer des observables. */
function serviceSimule(vue: Partial<VueDashboard> = {}) {
  return {
    vue$: of({
      statistiques: statistiques(),
      chargement: false,
      erreur: null,
      echecs: [],
      initial: false,
      ...vue,
    }),
    rafraichir: jasmine.createSpy('rafraichir'),
  };
}

describe('StatistiquesComponent', () => {
  let fixture: ComponentFixture<StatistiquesComponent>;
  let service: ReturnType<typeof serviceSimule>;

  async function configurer(vue: Partial<VueDashboard> = {}) {
    service = serviceSimule(vue);

    await TestBed.configureTestingModule({
      declarations: [
        StatistiquesComponent,
        StatCardComponent,
        LineChartComponent,
        DonutChartComponent,
        BarChartComponent,
        BarListComponent,
      ],
      imports: [CommonModule, RouterTestingModule],
      providers: [{ provide: StatistiquesService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(StatistiquesComponent);
    // Deux passes : la première résout l'`async pipe` (composant OnPush).
    fixture.detectChanges();
    fixture.detectChanges();
  }

  afterEach(() => TestBed.resetTestingModule());

  it('affiche les indicateurs et les graphiques du tableau de bord', async () => {
    await configurer();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.tb-titre')?.textContent).toContain('Tableau de bord');
    expect(element.querySelectorAll('.tb-kpi').length).toBe(2);
    expect(element.querySelector('app-line-chart')).toBeTruthy();
    expect(element.querySelector('app-donut-chart')).toBeTruthy();
    expect(element.querySelector('app-bar-chart')).toBeTruthy();
    expect(element.querySelector('app-bar-list')).toBeTruthy();
  });

  it('réduit la courbe à la période choisie', async () => {
    await configurer();

    const element = fixture.nativeElement as HTMLElement;
    const bouton = element.querySelector<HTMLButtonElement>('.tb-segments .tb-segment');
    bouton?.click();
    fixture.detectChanges();

    expect(bouton?.classList).toContain('actif');
    expect(fixture.componentInstance.periode$).toBeTruthy();
  });

  it('relance le calcul des statistiques à la demande', async () => {
    await configurer();

    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.tb-bouton')?.click();

    expect(service.rafraichir).toHaveBeenCalled();
  });

  it('affiche un état vide lorsque aucune donnée n\'existe', async () => {
    await configurer({
      statistiques: { ...statistiques(), cartes: [], aucuneDonnee: true },
    });

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.tb-vide')).toBeTruthy();
    expect(element.querySelectorAll('.tb-kpi').length).toBe(0);
  });

  it('signale les collections qui n\'ont pas pu être chargées', async () => {
    await configurer({ echecs: ['inspection'] });

    const alerte = (fixture.nativeElement as HTMLElement).querySelector('.tb-alerte.alert-warning');
    expect(alerte?.textContent).toContain('inspection');
  });
});
