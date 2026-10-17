import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Référence affichée dans le bandeau de partenaires. */
interface Partenaire {
  nom: string;
  icone: string;
}

/**
 * Section « Partenaires » : bandeau de références présentées sous forme de
 * badges (noms stylisés, sans logo externe à charger).
 */
@Component({
    selector: 'app-partenaires',
    templateUrl: './partenaires.component.html',
    styleUrl: './partenaires.component.css',
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartenairesComponent {
  readonly partenaires: Partenaire[] = [
    { nom: 'AeroTech', icone: 'fa-solid fa-plane' },
    { nom: 'Mécatron', icone: 'fa-solid fa-gears' },
    { nom: 'PharmaPlus', icone: 'fa-solid fa-pills' },
    { nom: 'AgroQual', icone: 'fa-solid fa-wheat-awn' },
    { nom: 'AutoParts', icone: 'fa-solid fa-car' },
    { nom: 'TextilPro', icone: 'fa-solid fa-shirt' },
  ];
}
