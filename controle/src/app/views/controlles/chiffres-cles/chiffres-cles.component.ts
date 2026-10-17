import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnalysesUtilisateurService } from '../../../services/analyses-utilisateur.service';

/** Indicateur clé affiché dans le bandeau de chiffres. */
interface ChiffreCle {
  id: string;
  libelle: string;
  icone: string;
  /** Valeur affichée (animée de 0 jusqu'à `cible`). */
  valeur: number;
  /** Valeur réelle issue des données. */
  cible: number;
  suffixe?: string;
}

/** Durée de l'animation de comptage, en millisecondes. */
const DUREE_ANIMATION = 900;
/** Nombre d'étapes de l'animation. */
const ETAPES = 30;

/**
 * Section « Chiffres clés » : reprend les indicateurs réels calculés par
 * `AnalysesUtilisateurService` et les anime d'un comptage progressif.
 */
@Component({
    selector: 'app-chiffres-cles',
    templateUrl: './chiffres-cles.component.html',
    styleUrl: './chiffres-cles.component.css',
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChiffresClesComponent implements OnInit {
  private readonly service = inject(AnalysesUtilisateurService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private animation?: ReturnType<typeof setInterval>;

  readonly chiffres: ChiffreCle[] = [
    { id: 'inspections', libelle: 'Inspections réalisées', icone: 'fa-solid fa-clipboard-check', valeur: 0, cible: 0 },
    { id: 'defauts', libelle: 'Défauts détectés', icone: 'fa-solid fa-bug', valeur: 0, cible: 0 },
    { id: 'conformite', libelle: 'Taux de conformité', icone: 'fa-solid fa-shield-halved', valeur: 0, cible: 0, suffixe: ' %' },
    { id: 'mois', libelle: 'Inspections ce mois-ci', icone: 'fa-solid fa-calendar-check', valeur: 0, cible: 0 },
  ];

  ngOnInit(): void {
    this.service.vue$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vue) => {
        const analyses = vue.analyses;
        this.mettreAJourCibles({
          inspections: analyses.totalInspections,
          defauts: analyses.totalDefauts,
          conformite: Math.round(analyses.tauxConformite),
          mois: analyses.inspectionsDuMois,
        });
      });

    this.destroyRef.onDestroy(() => this.arreterAnimation());
  }

  private mettreAJourCibles(valeurs: Record<string, number>): void {
    let changement = false;
    this.chiffres.forEach((chiffre) => {
      const valeur = valeurs[chiffre.id] ?? 0;
      if (chiffre.cible !== valeur) {
        chiffre.cible = valeur;
        changement = true;
      }
    });

    if (changement) {
      this.animer();
    }
  }

  /** Comptage progressif respectant la préférence de réduction des animations. */
  private animer(): void {
    this.arreterAnimation();

    const reduire =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduire) {
      this.chiffres.forEach((chiffre) => (chiffre.valeur = chiffre.cible));
      this.cdr.markForCheck();
      return;
    }

    let etape = 0;
    this.animation = setInterval(() => {
      etape += 1;
      const progression = Math.min(etape / ETAPES, 1);
      // Courbe d'apaisement (ease-out) pour un comptage naturel.
      const facteur = 1 - Math.pow(1 - progression, 3);

      this.chiffres.forEach((chiffre) => {
        chiffre.valeur = Math.round(chiffre.cible * facteur);
      });

      // OnPush : signaler la mise à jour à chaque étape de l'animation.
      this.cdr.markForCheck();

      if (progression >= 1) {
        this.arreterAnimation();
      }
    }, DUREE_ANIMATION / ETAPES);
  }

  private arreterAnimation(): void {
    if (this.animation !== undefined) {
      clearInterval(this.animation);
      this.animation = undefined;
    }
  }
}
