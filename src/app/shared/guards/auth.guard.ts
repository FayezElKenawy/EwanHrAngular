import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivateChild,
  CanActivate,
} from "@angular/router";
import { Observable, throwError } from "rxjs";
import { AuthService } from "@shared/services/auth.service";
import { map, catchError } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivateChild, CanActivate {
  constructor(private _authService: AuthService, private router: Router) {}

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    if (childRoute.children && childRoute.children.length > 0) {
      // NO Authintication For Main Routes
      return true;
    } else {
      return this.canActivate(childRoute, state);
    }
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    console.log('auth guard');

    history.pushState(null, null, environment.hostingFolder + state.url);
    return this._authService.getAuthUser().pipe(
      map((res) => {
          debugger
        if (res.isSuccess &&  !res.data.MustChangePassword) {
          route.data = { authUserVM: res.data };
          return true;
        }
        this.router.navigate(["/finance/auth/login"], {
          queryParams: { returnUrl: state.url },
        });
        return false;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.router.navigate(["/finance/auth/login"], {
            queryParams: { returnUrl: state.url },
          });
        }
        return throwError(error);
      })
    );
  }
}
