import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import {
  HttpClientModule,
  HTTP_INTERCEPTORS,
  HttpClient,
} from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { SharedModule } from "@shared/shared.module";
import { MessageService } from "primeng/api";
import { HttpTokenInterceptor } from "@shared/interceptor/http-token.interceptor";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { environment } from "../environments/environment";
import { NgIdleKeepaliveModule } from "@ng-idle/keepalive";
import { MomentModule } from "angular2-moment";
import { IdleExpiry, LocalStorageExpiry } from "@ng-idle/core";

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(
    http,
    "./assets/i18n/",
    ".json?cb=" + new Date().getTime()
  );
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgIdleKeepaliveModule.forRoot(),
    MomentModule,
    // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    MessageService,
    { provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
    {
      provide: IdleExpiry,
      useClass: LocalStorageExpiry,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
