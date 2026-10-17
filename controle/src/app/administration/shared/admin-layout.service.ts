import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * État partagé de la mise en page de l'administration.
 *
 * Permet à la barre latérale et à la navbar de communiquer sans lien
 * direct : réduction du menu (desktop) et ouverture en tiroir (mobile).
 */
@Injectable({ providedIn: 'root' })
export class AdminLayoutService {
    /** Largeur d'écran sous laquelle le menu passe en mode tiroir. */
    static readonly SEUIL_MOBILE = 991;

    /** Indique si la largeur fournie correspond à un écran mobile (tiroir). */
    static estLargeurMobile(largeur: number): boolean {
        return largeur <= AdminLayoutService.SEUIL_MOBILE;
    }

    private readonly reduit = new BehaviorSubject<boolean>(false);
    private readonly mobileOuvert = new BehaviorSubject<boolean>(false);

    /** Vrai lorsque la barre latérale est repliée en icônes (desktop). */
    readonly reduit$: Observable<boolean> = this.reduit.asObservable();
    /** Vrai lorsque le tiroir latéral est ouvert (mobile). */
    readonly mobileOuvert$: Observable<boolean> = this.mobileOuvert.asObservable();

    /** Bascule le menu : tiroir sur mobile, repli en icônes sur desktop. */
    basculer(): void {
        if (this.estMobile()) {
            this.basculerMobile();
        } else {
            this.basculerReduit();
        }
    }

    basculerReduit(): void {
        this.reduit.next(!this.reduit.value);
    }

    basculerMobile(): void {
        this.mobileOuvert.next(!this.mobileOuvert.value);
    }

    fermerMobile(): void {
        if (this.mobileOuvert.value) {
            this.mobileOuvert.next(false);
        }
    }

    private estMobile(): boolean {
        return typeof window !== 'undefined' && window.innerWidth <= AdminLayoutService.SEUIL_MOBILE;
    }
}
