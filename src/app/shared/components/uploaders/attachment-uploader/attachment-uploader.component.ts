import {
  Component,
  OnInit,
  Input,
  forwardRef,
  SimpleChanges,
  OnChanges
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { GlobalService, MessageType } from "@shared/services/global.service";
import { DomSanitizer } from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";

@Component({
  selector: "app-attachment-uploader",
  templateUrl: "./attachment-uploader.component.html",
  styleUrls: ["./attachment-uploader.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => AttachmentUploaderComponent)
    }
  ]
})
export class AttachmentUploaderComponent
  implements OnInit, OnChanges, ControlValueAccessor {
  loading: boolean;
  value: any;

  exTensionToView = ["jpeg", "png", "gif", "pdf", "svg", "html", "jpeg", "jpg"];

  @Input() maxSizeMB = 5;
  @Input() downloadName = "File";
  @Input() fileId;
  @Input() readOnly;

  @Input() fullPath = false;
  onChange: (newvalue) => void;
  onTouched: (newvalue) => void;
  disabled: boolean;
  showDisplay: boolean;
  fileasBase64: string;
  FileExTension: string;

  constructor(
    private _globaleService: GlobalService,
    public _domSanitizer: DomSanitizer,
    private _http: HttpClient
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.fileId && changes.fileId.currentValue) {
      this.fileId = changes.fileId.currentValue;
      this.writeValue(changes.fileId.currentValue);
    }
  }
  ngOnInit() {}

  processFile(fileInput: any) {
    this.loading = true;
    const file: File = fileInput.files[0];
    if (!file) {
      this.loading = false;
      return 0;
    }
    const fileName = file.name;

    const reader = new FileReader();
    if (file && file.size <= this.maxSizeMB * 1000000) {
      reader.addEventListener("load", (event: any) => {});
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.FileExTension = fileName.split(".")[1];
        let result = reader.result.toString().split(";")[1];

        if (file.type.toLowerCase().includes("image")) {
          result = "data:image/" + this.FileExTension + ";" + result;
        } else {
          result = "data:application/" + this.FileExTension + ";" + result;
        }

        this.value = result;
        this.onChange(this.value);
        this.fileasBase64 = result;
        this.loading = false;
      };
      reader.onerror = () => {
        this.value = "";
        this.onChange(this.value);

        this.loading = false;
      };
    } else {
      this._globaleService.messageAlert(
        MessageType.Error,
        " You Should Choose A Valid  File With  Size Less Than " +
          this.maxSizeMB +
          "MB"
      );
      this.loading = false;
    }
  }

  showFileCallBack() {
    if (!this.exTensionToView.includes(this.FileExTension.toLowerCase())) {
      this._globaleService.messageAlert(
        MessageType.Error,
        "This File Can Be Downloaded Only"
      );
      return 0;
    }
    const modal = document.getElementById("FileViewermyModal") as HTMLElement;

    const modalImg = document.getElementById("imageToView") as HTMLHtmlElement;
    const modalIFrame = document.getElementById(
      "FileViewerIframe"
    ) as HTMLHtmlElement;

    modal.style.display = "block";

    if (this.fileasBase64.includes("image")) {
      modalImg.style.display = "block";
      modalIFrame.style.display = "none";
      modalImg.setAttribute("src", this.fileasBase64.replace("svg", "svg+xml"));
    } else {
      modalImg.style.display = "none";
      modalIFrame.style.display = "block";
      modalIFrame.setAttribute("src", this.fileasBase64);
    }

    const span = document.getElementsByClassName(
      "FileViewerClose"
    )[0] as HTMLHtmlElement;

    span.onclick = function() {
      modal.style.display = "none";
    };
    modal.onclick = function() {
      modal.style.display = "none";
    };
    modalImg.onclick = function(event) {
      event.stopPropagation();
    };
  }

  downloadFileClalBack() {
    const link = document.createElement("a");
    link.href = this.fileasBase64;
    link.target = "_blank";

    link.download = this.downloadName + "." + this.FileExTension;
    link.click();
  }

  // Value Accessor Functions
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  writeValue(value: string) {
    if (this.fullPath) {
      this.value = value ? value : "";
    } else {
      if (this.fileId && this.fileId != null) {
        this.value = environment.storagePath + "/" + this.fileId;
      } else {
        this.value = "";
      }
    }
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  // End Value Accessor
  loadFile(url, callback: any) {
    //debugger
    if (url.includes("http")) {
      this.loading = true;
      this._http.get(url, { responseType: "blob" }).subscribe(
        (data: File) => {
          this.FileExTension = data.type.split("/")[1];
          const reader = new FileReader();
          reader.readAsDataURL(data);
          reader.onloadend = () => {
            const result = reader.result
              .toString()
              .replace("octet-stream", this.FileExTension);
            const base64data = result;
            this.fileasBase64 = base64data.toString();
            callback();
          };
        },
        err => {
          this.loading = false;
          if (err.status == 404) {
            this._globaleService.messageAlert(
              MessageType.Warning,
              "File Not Found"
            );
          } else {
            this._globaleService.messageAlert(
              MessageType.Warning,
              "ServerError"
            );
          }
        },
        () => {
          this.loading = false;
        }
      );
    } else {
      callback();
    }
  }
}
