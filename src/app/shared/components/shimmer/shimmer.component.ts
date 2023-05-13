import { Component, OnInit, Input } from '@angular/core';
import { RangePipe } from 'ngx-pipes';

@Component({
  selector: 'app-shimmer',
  templateUrl: './shimmer.component.html',
  styleUrls: ['./shimmer.component.scss'],
  providers: [RangePipe]
})
export class ShimmerComponent implements OnInit {

  @Input() cols = 3;
  @Input() rows = 4;
  @Input() repeat = 3;
  @Input() clipped = true;

  constructor(private rangePipe: RangePipe) { }

  ngOnInit() {
    this.cols = this.rangePipe.transform(1, this.cols);
    this.rows = this.rangePipe.transform(1, this.rows);
    this.repeat = this.rangePipe.transform(1, this.repeat);
  }

}
