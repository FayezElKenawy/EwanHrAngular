import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@shared/services/auth.service';
import { GlobalService } from '@shared/services/global.service';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
  constructor(
    private _authService: AuthService,
    private _globalService: GlobalService
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const headersConfig = {};
    const token = this._authService.getToken();
    const lang = this._globalService.languageGetCurrent;
    if (token) {
      headersConfig['Authorization'] = `${token}`;
    }

    headersConfig['Accept-Language'] = `${lang}`;
    headersConfig['Language'] = `${lang}`;

    const request = req.clone({ setHeaders: headersConfig });
    return next.handle(request);
  }
}
