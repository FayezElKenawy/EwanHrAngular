import { CreateRequestServiceComponent } from './../create-request-service/create-request-service.component';
import { ServiceRequestService } from 'src/app/sales/requests-services/service-request.service';
import { Component, OnInit, Input } from '@angular/core';
import { IServiceResult } from '@shared/interfaces/results';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-laborer-details',
  templateUrl: './laborer-details.component.html',
  styleUrls: ['./laborer-details.component.scss']
})
export class LaborerDetailsComponent implements OnInit {
  viewModel: any;
  progressSpinner: boolean;
  Cols: any[] = [];
  uploadPath = environment.coreApiUrl + '/Uploading/File/Public';

  constructor(private _serviceRequest: ServiceRequestService) { }

  ngOnInit() {

  }
  getDetails(id: string) {
    this.progressSpinner = true;
    this._serviceRequest.GetLaborer(id).subscribe(
      (result: IServiceResult) => {
        if (result.isSuccess) {
          this.viewModel = result.data;
        }
      },
      () => (this.progressSpinner = false),
      () => (this.progressSpinner = false)
    );
  }
}
