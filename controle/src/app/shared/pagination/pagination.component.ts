import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Pagination réutilisable pour les tableaux de l'espace d'administration.
 *
 * Composant purement présentationnel : il ne connaît que le total d'éléments,
 * la page courante et la taille de page. Le parent se charge de découper la
 * liste affichée et de réagir à `pageChange`.
 */
@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
  standalone: false,
})
export class PaginationComponent {
  /** Page courante (1-indexée). */
  @Input() page = 1;

  /** Nombre d'éléments affichés par page. */
  @Input() pageSize = 10;

  /** Nombre total d'éléments. */
  @Input() total = 0;

  /** Émis lorsqu'une nouvelle page est demandée. */
  @Output() pageChange = new EventEmitter<number>();

  /** Nombre total de pages (au moins 1). */
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  /** Index du premier élément affiché (1-indexé, 0 si vide). */
  get debut(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  /** Index du dernier élément affiché (1-indexé). */
  get fin(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  /**
   * Numéros de page à afficher, avec des ellipses (« ... ») encadrant la page
   * courante lorsqu'il y a beaucoup de pages.
   */
  get pages(): (number | '…')[] {
    const total = this.totalPages;
    const courante = this.page;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const resultat: (number | '…')[] = [1];
    const debut = Math.max(2, courante - 1);
    const fin = Math.min(total - 1, courante + 1);

    if (debut > 2) {
      resultat.push('…');
    }
    for (let p = debut; p <= fin; p++) {
      resultat.push(p);
    }
    if (fin < total - 1) {
      resultat.push('…');
    }
    resultat.push(total);

    return resultat;
  }

  /** Va sur une page précise. */
  aller(page: number | '…'): void {
    if (page === '…') {
      return;
    }
    const cible = Math.min(Math.max(1, page), this.totalPages);
    if (cible === this.page) {
      return;
    }
    this.pageChange.emit(cible);
  }

  /** Page suivante. */
  suivante(): void {
    this.aller(this.page + 1);
  }

  /** Page précédente. */
  precedente(): void {
    this.aller(this.page - 1);
  }
}
