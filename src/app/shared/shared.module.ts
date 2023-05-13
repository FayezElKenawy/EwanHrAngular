import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { NgPipesModule } from "ngx-pipes";
import { NgxLoadingModule } from "ngx-loading";
import { SharedRoutingModule } from "./shared-routing.module";
import { HeaderComponent } from "@shared/components/header/header.component";
import { FooterComponent } from "@shared/components/footer/footer.component";
import { PageNotFoundComponent } from "@shared/components/page-not-found/page-not-found.component";
import { AuthLayoutComponent } from "./layouts/auth-layout/auth-layout.component";
import { CoreLayoutComponent } from "./layouts/core-layout/core-layout.component";
import { ShimmerComponent } from "./components/shimmer/shimmer.component";
import { ProgressSpinnerComponent } from "./components/progress-spinner/progress-spinner.component";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { AutoCompleteModule } from "primeng/autocomplete";
import { DropdownModule } from "primeng/dropdown";
import { TableModule } from "primeng/table";
import { ContextMenuModule } from "primeng/contextmenu";
import { PaginatorModule } from "primeng/paginator";
import { CalendarModule } from "primeng/calendar";
import { ReportModelViewerComponent } from "./components/report-model-viewer/report-model-viewer.component";
import { FileUploadComponent } from "./components/file-upload/file-upload.component";
import { FileUploadModule } from "ng2-file-upload";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { ChartModule } from "primeng/chart";
import { ReportViewerComponent } from "./components/reporting/report-viewer/report-viewer.component";
import { AttachmentUploaderComponent } from "./components/uploaders/attachment-uploader/attachment-uploader.component";
import { ImageUploaderComponent } from "./components/uploaders/image-uploader/image-uploader.component";
import { ImageviewerComponent } from "./components/imageviewer/imageviewer.component";
import { CustomReportComponent } from "./components/reporting/custom-report/custom-report.component";
import { DynamicReportViewerComponent } from "./components/reporting/dynamic-report-viewer/dynamic-report-viewer.component";
import { NotAuthorizedComponent } from "./components/not-authorized/not-authorized.component";
import { AuthorizationDirective } from "./directives/authorization.directive";
import { UserNotificationListComponent } from "../notification/user-notification/user-notification-list/user-notification-list.component";

import { DynamicDialogModule } from "primeng/dynamicDialog";
import { InputSwitchModule } from 'primeng/inputswitch';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(
    http,
    "./assets/i18n/",
    ".json?cb=" + new Date().getTime()
  );
}
@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    PageNotFoundComponent,
    AuthLayoutComponent,
    CoreLayoutComponent,
    ShimmerComponent,
    AuthorizationDirective,
    ProgressSpinnerComponent,
    ReportModelViewerComponent,
    ReportViewerComponent,
    NotAuthorizedComponent,
    ImageUploaderComponent,
    ImageviewerComponent,
    FileUploadComponent,
    AttachmentUploaderComponent,
    CustomReportComponent,
    DynamicReportViewerComponent,
    UserNotificationListComponent,
  ],
  entryComponents: [NotAuthorizedComponent],
  imports: [
    CommonModule,
    SharedRoutingModule,
    NgPipesModule,
    PaginatorModule,
    NgxLoadingModule.forRoot({
      backdropBorderRadius: "3px",
      primaryColour: "#e01972",
      secondaryColour: "#e01972",
      tertiaryColour: "#e01972",
    }),
    ProgressSpinnerModule,
    AutoCompleteModule,
    DropdownModule,
    InputSwitchModule,
    ContextMenuModule,
    TableModule,
    CalendarModule,
    FileUploadModule,
    ReactiveFormsModule,
    InputSwitchModule,
    FormsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ChartModule,
    DynamicDialogModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    FileUploadComponent,
    ReportModelViewerComponent,
    ReportViewerComponent,
    PageNotFoundComponent,
    AuthLayoutComponent,
    CoreLayoutComponent,
    ShimmerComponent,
    ProgressSpinnerComponent,
    AutoCompleteModule,
    DropdownModule,
    InputSwitchModule,
    TableModule,
    ContextMenuModule,
    CalendarModule,
    FileUploadModule,
    FormsModule,
    ImageUploaderComponent,
    ImageviewerComponent,
    ReactiveFormsModule,
    AttachmentUploaderComponent,
    TranslateModule,
    AuthorizationDirective,
    ChartModule,
    DynamicReportViewerComponent,
    CustomReportComponent,
    InputSwitchModule,
    DynamicDialogModule
  ],
  providers: [DatePipe],
})
export class SharedModule {}
