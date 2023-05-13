import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-imageviewer',
  templateUrl: './imageviewer.component.html',
  styleUrls: ['./imageviewer.component.scss']
})
export class ImageviewerComponent implements OnChanges {
  @Input() public src: string;
  @Input() public imgStyle: string;
  @Output() error: EventEmitter<any> = new EventEmitter();
  @Output() afterLoad: EventEmitter<any> = new EventEmitter();
  @Input() defaultImage='';
  imageToSHow: string = this.defaultImage;
  ngOnChanges(): void {
    this.loadImage(this.src);
  }

  constructor(private httpClient: HttpClient) {}

  loadImage(url) {
    this.httpClient.get(url, { responseType: 'blob' }).subscribe(
      data => {
        const reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onloadend = () => {
          const base64data = reader.result;
          this.imageToSHow = base64data.toString();
        };
      },
      () => this.errorImage(),
      () => this.afterImageload()
    );
  }

  errorImage() {
    this.imageToSHow = this.defaultImage;
    this.error.emit();
  }

  afterImageload() {
    this.afterLoad.emit();
  }

  showImage(image: HTMLElement) {
    const modal = document.getElementById('FileViewermyModal') as HTMLElement;

    const modalImg = document.getElementById('imageToView') as HTMLHtmlElement;
    const modalIFrame = document.getElementById(
      'FileViewerIframe'
    ) as HTMLHtmlElement;

    modal.style.display = 'block';
    modalIFrame.style.display = 'none';
    modalImg.style.display = 'block';
    modalImg.setAttribute('src', image.getAttribute('src'));

    const span = document.getElementsByClassName(
      'FileViewerClose'
    )[0] as HTMLHtmlElement;

    span.onclick = function() {
      modal.style.display = 'none';
    };
    modal.onclick = function() {
      modal.style.display = 'none';
    };
    modalImg.onclick = function(event) {
      event.stopPropagation();
    };
  }
}
