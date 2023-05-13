import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IResultVM, IServiceResult } from '@shared/interfaces/results';
import { AuthService } from '@shared/services/auth.service';
import { ServiceRequestService } from '../../requests-services/service-request.service';
import { ContractService } from '../contract.service';

@Component({
  selector: 'app-available-labors-for-holding',
  templateUrl: './available-labors-for-holding.component.html',
  styleUrls: ['./available-labors-for-holding.component.scss']
})
export class AvailableLaborsForHoldingComponent implements OnInit {
  @Input('professionId') professionId: string;
  @Input('nationalityId') nationalityId: string;
  @Input('branchId') branchId: string;
  @Input('id') id: number;
  @Output() saved = new EventEmitter<boolean>();
 
  submitted: boolean = false;
  form: FormGroup;
  currentYear = new Date().getFullYear() + 5;

  progressSpinner: boolean;
  minDateValue: any;
  selectedLaborer: any;

  //Pagination for laborers list
  totalRecords: number;
  pageNumber: Number = 1;
  pageSize: number = 10;
  loading: boolean = false;
  selectedBundle: any;
  AssignLabor: any;
  filteredLaborerFileArray: any[];

  laborerCols: { field: string; 
    header: string; 
    hidden: boolean }[];

  searchTerm:string = '';
  isSearchSubmitted:boolean = false;

  laborerStatusList: any[]=[];

  constructor( 
    private _serviceRequestService: ServiceRequestService,
    private _contractService: ContractService,
    private _formBuilder: FormBuilder,
    private _datePipe: DatePipe,
    private _authService: AuthService

  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.createForm();

    this.laborerCols = [
      { field: "Id", header: "App.Fields.LaborerFileId", hidden: false },
      {
        field: "FullName",
        header: "App.Fields.LaborerFileName",
        hidden: false,
      },
      {
        field: "NationalityName",
        header: "App.Fields.Nationality",
        hidden: false,
      },
      {
        field: "ProfessionName",
        header: "App.Fields.Profession",
        hidden: false,
      },
      {
        field: "BranchName",
        header: "App.Fields.Branch",
        hidden: false,
      },
    ];
    this.loadLabores(null);
  }

  createForm() {
    this.form = this._formBuilder.group({
      ExpectedLeaveDate: ["", Validators.required],
    });
  }
  
  loadLabores(event) {
    this.pageNumber = event? (event.first / 10 + 1) : 1;
    this.searchLaborer();
  }

  searchLaborer() {  
    this.progressSpinner = true;
    this._serviceRequestService
      .SearchLaborer(
        this.searchTerm,
        String(this.pageNumber),
        this.nationalityId,
        this.professionId,
        (this.branchId)? this.branchId : this._authService.currentAuthUser.BranchId
      )
      .subscribe(
        (result: IServiceResult) => {
          this.filteredLaborerFileArray = [];
          this.filteredLaborerFileArray = result.data.LaborerFilesVM;
          this.totalRecords = result.data.PagingMetaData.TotalItemCount;
        },

        () => {
          this.progressSpinner = false;
        },
        () => {
          this.progressSpinner = false;
        }
      );
  }

  getLaborerStatus(event){
    this._contractService.getLaboerStatus().subscribe((result:IResultVM) =>{
        debugger;
       this.laborerStatusList = result.Data.LaborerStatusesVM;
    })
  }

  onClear(controlName: string) {
    this.form.controls[controlName].setValue(null);
  }

  onSubmit(){ 
    this.submitted = true;
    if(!this.selectedLaborer || this.form.invalid){
      return 0;
    }

    this.progressSpinner = true;

    let postedVM: any = {};
    postedVM.contractId= this.id;
    postedVM.expectedLeaveDate= this._datePipe.transform(this.form.get('ExpectedLeaveDate').value);
    postedVM.newLaborFileId= this.selectedLaborer.Id;

    this._contractService.onSelectLaborForHolding(postedVM).subscribe(res=>{
      if(res.isSuccess){
        this.submitted = false;
        this.saved.emit(true);
      }
    },
    () => {
      this.progressSpinner = false;
    },
    () => {
      this.progressSpinner = false;
    }
    )


  }

  onSearch() {
    this.isSearchSubmitted = true;
    this.loadLabores(null)
  }
}
