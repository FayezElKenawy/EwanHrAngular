import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload';
import { environment } from '@environments/environment';
import { GlobalService, MessageType } from '@shared/services/global.service';
import { AuthService } from '@shared/services/auth.service';
import { IResultVM } from '@shared/interfaces/results';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  result: IResultVM;
  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
  @Output() loader: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() IsTotalBasedHours: any;
  @Input() contractId: any;

  serviceUrl = `${
    environment.individualSectorApiUrl
    }/LaborerAffairs/LaborerAttendanceLog`;
  uploader: FileUploader;
  hasBaseDropZoneOver = false;
  Files: any[] = [];
  constructor(
    private globalHandler: GlobalService,
    private _authenticationService: AuthService
  ) { }

  ngOnInit() {
    this.initializeUploader();
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: `${this.serviceUrl}/UploadFiles`,
      authToken: this._authenticationService.getToken(),
      isHTML5: true,
      queueLimit: 2,
      removeAfterUpload: false,
      autoUpload: false,
      maxFileSize: 1000 * 1024 * 1024,
      allowedFileType: ['xls']
    });

    this.uploader.onAfterAddingFile = file => {
      file.withCredentials = false;
      if (this.uploader.queue.length > 1) {
        this.uploader.removeFromQueue(this.uploader.queue[0]);
      }
    };
    this.uploader.onCompleteItem = (
      item: any,
      response: any,
      status: any,
      headers: any
    ) => {

      this.uploader.queue[0].isUploaded = false;

      if (response == '' || response == null) {
        this.globalHandler.errorHandler(
          new HttpErrorResponse({ error: 'bar', status: 403 })
        );
      } else {
        const result = JSON.parse(response);
        if (result.IsSuccess) {
          this.removeAllFiles();
          this.refresh.emit({ Id: this.contractId });

          const totalRows =
            Number(result.Data.AddedCount) + Number(result.Data.ExistCount);
          const m1 = 'عدد السجلات في الملف ' + totalRows.toString() + ' صف ';
          const m2 =
            result.Data.ExistCount > 0
              ? ' منهم ' +
              result.Data.ExistCount.toString() +
              ' صف كانو مضافين بالفعل '
              : '';
          const m3 =
            result.Data.AddedCount > 0
              ? ' تم اضافة ' + result.Data.AddedCount.toString() + ' صف '
              : ' لم تتم اضافة اي صف .';

          const SuccessMessage =
            '<br>' + m1 + '</br><br>' + m2 + '</br><br>' + m3 + '</br>';
          this.globalHandler.messageAlert(MessageType.Success, SuccessMessage, true);

          return;
        }
        if (!result.IsSuccess) {
          if (result.FailedReason === 'invalid-contract-id') {
            this.globalHandler.messageAlert(MessageType.Error, 'يجب اختيار رقم العقد');
          }
          if (result.FailedReason === 'template-of-file-not-correct') {
            this.globalHandler.messageAlert(MessageType.Error, 'نوع الملف الذي ادخلته ليس صحيح ');
          }
          if (result.FailedReason === 'invalid-file-type-totalbasedhours') {
            this.globalHandler.messageAlert(MessageType.Error,
              'نوع الملف الذي ادخلته ليس اجمالي عدد الساعات'
            );
          }
          if (result.FailedReason === 'invalid-file-type-from-to') {
            this.globalHandler.messageAlert(MessageType.Error,
              'نوع الملف الذي ادخلته ليس من الى '
            );
          }
          if (
            result.FailedReason ===
            'invalid-file-type-more-one-employee-in-file'
          ) {
            this.globalHandler.messageAlert(MessageType.Error,
              'رقم العقد خطأ والموظف في الملف لاينتمي للعقد '
            );
          }
          if (result.FailedReason === 'failed-in-segments') {
            this.globalHandler.messageAlert(MessageType.Error, 'حدث خطأ في الترحيل الى سيجمنت');
          }
          this.loader.emit(false);
        }
      }
    };
    this.uploader.onBeforeUploadItem = (file: FileItem) => {
      this.loader.emit(true);
    };
    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('contractId', this.contractId);
      form.append('IsTotalBasedHours', this.IsTotalBasedHours);
    };
  }

  removeAllFiles() {
    this.uploader.queue = [];
  }
}
// class CustomFileUpload extends FileUploader {
//   constructor(options: FileUploaderOptions) {
//     super(options);
//   }

//   uploadAllFiles(): void {
//     let xhr = new XMLHttpRequest();
//     let sendable = new FormData();
//     let fakeitem: FileItem = null;
//     this.onBuildItemForm(fakeitem, sendable);
//     for (const item of this.queue) {
//       item.isReady = true;
//       item.isUploading = true;
//       item.isUploaded = false;
//       item.isSuccess = false;
//       item.isCancel = false;
//       item.isError = false;
//       item.progress = 0;

//       if (typeof item._file.size !== 'number') {
//         throw new TypeError('The file specified is no longer valid');
//       }
//       sendable.append('files', item._file, item.file.name);
//     }

//     if (this.options.additionalParameter !== undefined) {
//       Object.keys(this.options.additionalParameter).forEach(key => {
//         sendable.append(key, this.options.additionalParameter[key]);
//       });
//     }
//     xhr.upload.onprogress = (event: any) => {
//       let progress = Math.round(
//         event.lengthComputable ? (event.loaded * 100) / event.total : 0
//       );
//       this._onProgressItem(this.queue[0], progress);
//     };

//     xhr.onload = () => {
//       const gist =
//         (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304
//           ? 'Success'
//           : 'Error';
//       const method = 'on' + gist + 'Item';
//       this[method](fakeitem, null, xhr.status, null);
//     };
//     xhr.onerror = () => {
//       this.onErrorItem(fakeitem, null, xhr.status, null);
//     };

//     xhr.onabort = () => {
//       this.onErrorItem(fakeitem, null, xhr.status, null);
//     };

//     xhr.open('POST', this.options.url, true);
//     xhr.withCredentials = false;
//     if (this.options.headers) {
//       for (let _i = 0, _a = this.options.headers; _i < _a.length; _i++) {
//         let header = _a[_i];
//         xhr.setRequestHeader(header.name, header.value);
//       }
//     }
//     if (this.authToken) {
//       xhr.setRequestHeader(this.authTokenHeader, this.authToken);
//     }
//     xhr.send(sendable);
//   }
// }
