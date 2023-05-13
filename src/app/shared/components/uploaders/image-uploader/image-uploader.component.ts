import {
  Component,
  OnInit,
  Input,
  forwardRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { GlobalService, MessageType } from '@shared/services/global.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => ImageUploaderComponent)
    }
  ]
})
export class ImageUploaderComponent
  implements OnInit, OnChanges, ControlValueAccessor {
  loading: boolean;
  value: string;
  validExstension = ['jpeg', 'png', 'gif', 'pdf', 'jpg', 'pjpeg', 'pjp'];

  @Input() defaultImage='';
  imageUrl = this.defaultImage;
  @Input() maxSizeMB = 5;
  @Input() title = 'LaborerData.Buttons.UploadPhoto';
  @Input() fileId;
  @Input() fullPath = false;
  @Input() readOnly;

  onChange: (newvalue) => void;
  onTouched: (newvalue) => void;
  disabled: boolean;
  FileExTension: string;

  constructor(private _globaleService: GlobalService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.fileId && changes.fileId.currentValue) {
      this.fileId = changes.fileId.currentValue;
      this.writeValue(changes.fileId.currentValue);
    }
  }
  ngOnInit() {}

  errorImage() {
    this.value = '';
    this.onChange('');
    this.loading = false;
  }

  afterImageload() {
    this.loading = false;
  }

  processFile(imageInput: any) {
    this.loading = true;
    const file: File = imageInput.files[0];
    const reader = new FileReader();
    if (
      file &&
      file.type.includes('image') &&
      file.size <= this.maxSizeMB * 1000000 &&
      this.validExstension.includes(file.name.split('.')[1].toLowerCase())
    ) {
      reader.addEventListener('load', (event: any) => {});
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.FileExTension = file.name.split('.')[1];

        let result = reader.result.toString().split(';')[1];
        if (file.type.toLowerCase().includes('image')) {
          result = 'data:image/' + this.FileExTension + ';' + result;
        } else {
          result = 'data:application/' + this.FileExTension + ';' + result;
        }
        this.imageUrl = result;

        this.value = this.imageUrl;
        this.onChange(this.value);

        this.loading = false;
      };
      reader.onerror = () => {
        this.imageUrl = this.defaultImage;
        this.value = '';
        this.onChange('');

        this.loading = false;
      };
    } else {
      this._globaleService.messageAlert(
        MessageType.Error,
        ' You Should Choose A Valid  Image(' +
          this.validExstension.toString() +
          ') With  Size Less Than ' +
          this.maxSizeMB +
          ' MB '
      );
      this.loading = false;
    }
  }

  writeValue(value: string) {
    if (this.fullPath) {
      this.loading = true;

      this.value = value ? value : '';
    } else {
      if (this.fileId && this.fileId != null) {
        this.value = environment.storagePath + '/' + this.fileId;
      } else {
        this.value = '';
      }
    }
    this.imageUrl = this.value ? this.value : this.defaultImage;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
