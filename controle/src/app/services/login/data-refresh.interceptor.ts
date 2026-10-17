import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { DataRefreshService } from '../data-refresh.service';

/** Méthodes HTTP qui modifient l'état des données. */
const METHODES_MODIFIANTES = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Publie un événement de rafraîchissement lorsqu'une requête d'écriture
 * aboutit. Le tableau de bord (et tout autre consommateur de
 * `DataRefreshService`) se met alors à jour en temps réel.
 */
@Injectable()
export class DataRefreshInterceptor implements HttpInterceptor {
  constructor(private dataRefresh: DataRefreshService) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const ressource = DataRefreshService.ressourceDepuisUrl(req.url);
    const modifiante = METHODES_MODIFIANTES.has(req.method.toUpperCase());

    if (!ressource || !modifiante) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      tap((event) => {
        if (
          event instanceof HttpResponse &&
          event.status >= 200 &&
          event.status < 300
        ) {
          this.dataRefresh.notifier(ressource);
        }
      })
    );
  }
}
