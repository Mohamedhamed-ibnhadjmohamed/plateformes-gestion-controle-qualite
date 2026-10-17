import { Component, inject } from '@angular/core';
import { ViewportScroller } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    standalone: false
})
export class AppComponent {
    private readonly viewportScroller = inject(ViewportScroller);

    constructor() {
        // La navbar est fixe en haut de l'écran : on décale le défilement vers
        // les ancres de sa hauteur pour ne pas masquer le titre de section.
        this.viewportScroller.setOffset([0, 88]);
    }
}
