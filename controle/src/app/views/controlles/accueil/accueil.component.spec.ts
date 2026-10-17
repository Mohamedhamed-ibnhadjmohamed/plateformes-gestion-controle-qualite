import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { AccueilComponent } from './accueil.component';
import { AnalysesUtilisateurService, VueAnalyses } from '../../../services/analyses-utilisateur.service';
import { StatCardComponent } from '../../../shared/stat-card/stat-card.component';
import { CarteStatistique } from '../../../models/Statistiques';

/** Quatre indicateurs, comme ceux du bandeau de l'accueil. */
function cartes(): CarteStatistique[] {
  return [
    {
      id: 'inspections',
      libelle: 'Mes inspections',
      valeur: 7,
      legende: '3 ce mois-ci',
      icone: 'fas fa-clipboard-check',
      ton: 'primary',
      lien: '/home/consulter',
    },
    {
      id: 'conformite',
      libelle: 'Mon taux de conformité',
      valeur: 86,
      suffixe: '%',
      legende: '1 inspection refusée',
      icone: 'fas fa-circle-check',
      ton: 'primary',
      progression: 86,
    },
    {
      id: 'defauts',
      libelle: 'Défauts que j\'ai constatés',
      valeur: 17,
      legende: '5 critiqués · 5 majeurs',
      icone: 'fas fa-triangle-exclamation',
      ton: 'danger',
    },
    {
      id: 'indice',
      libelle: 'Indice de qualité',
      valeur: 68,
      suffixe: '/100',
      legende: 'Score de mes contrôles',
      icone: 'fas fa-gauge-high',
      ton: 'success',
      progression: 68,
    },
  ];
}

/** Service simulé : la page consomme des observables. */
function serviceSimule(vue: Partial<VueAnalyses> = {}) {
  return {
    vue$: of({
      analyses: {
        cartes: cartes(),
        totalInspections: 7,
        aucuneDonnee: false,
      },
      chargement: false,
      erreur: null,
      echecs: [],
      initial: false,
      ...vue,
    }),
  };
}

/** Analyses sans aucune inspection. */
function analysesVides() {
  return {
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
  } as unknown as VueAnalyses['analyses'];
}

describe('AccueilComponent', () => {
  let fixture: ComponentFixture<AccueilComponent>;
  let service: ReturnType<typeof serviceSimule>;

  async function configurer(vue: Partial<VueAnalyses> = {}) {
    service = serviceSimule(vue);

    await TestBed.configureTestingModule({
      declarations: [AccueilComponent, StatCardComponent],
      imports: [CommonModule, RouterTestingModule],
      // La landing et ses sections ne sont pas instanciées ici (schéma permissif).
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: AnalysesUtilisateurService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(AccueilComponent);
    // Deux passes : la première résout l'`async pipe`.
    fixture.detectChanges();
    fixture.detectChanges();
  }

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.removeItem('user');
  });

  it('should create', async () => {
    await configurer();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('affiche le bandeau de synthèse et le lien vers les analyses', async () => {
    await configurer();

    const element = fixture.nativeElement as HTMLElement;
    const bandeau = element.querySelector('.accueil-stats');
    expect(bandeau).toBeTruthy();
    expect(bandeau?.querySelectorAll('app-stat-card').length).toBe(4);
    expect(bandeau?.querySelector('a')?.getAttribute('href')).toBe('/home/analyses');
  });

  it('accueille l\'utilisateur connecté par son prénom', async () => {
    localStorage.setItem('user', JSON.stringify({ utilisateur: { prenom: 'Karim', nom: 'Benali' } }));
    await configurer();

    const titre = (fixture.nativeElement as HTMLElement).querySelector('.accueil-stats-titre');
    expect(titre?.textContent).toContain('Bonjour Karim');
  });

  it('reste silencieux lorsqu\'aucune analyse n\'est disponible', async () => {
    await configurer({ analyses: analysesVides() });

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.accueil-stats')).toBeNull();
    // Le contenu marketing de la landing reste présent.
    expect(element.querySelector('app-landing')).toBeTruthy();
  });
});
