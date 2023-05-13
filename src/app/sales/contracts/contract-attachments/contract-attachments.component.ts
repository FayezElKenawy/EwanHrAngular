import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
  AbstractControl,
} from "@angular/forms";
import { ContractAttachmentsService } from "../contract-attachments.service";
import { IServiceResult } from "@shared/interfaces/results";
import { Router, ActivatedRoute } from "@angular/router";
import { DatePipe } from "@angular/common";
import { environment } from "@environments/environment";
import { ReportModelViewerComponent } from "@shared/components/report-model-viewer/report-model-viewer.component";

export enum pageModes {
  ViewOnly = 1,
  Edit = 2,
  EditLimted = 3,
  NoAction = 4,
}
@Component({
  selector: "app-contract-attachments",
  templateUrl: "./contract-attachments.component.html",
  styles: [],
})
export class ContractAttachmentsComponent implements OnInit {
  form: FormGroup;
  @ViewChild(ReportModelViewerComponent)
  reportchild: ReportModelViewerComponent;
  viewModel: any;
  filteredArray: any[];
  submitted: Boolean;
  progressSpinner: boolean;
  filteredArrayServer: any[];
  selectedLaborer: any;
  disableControl = false;
  cols: any;
  mandatoryCols: any;
  dataItems: any;
  tempDataItems = new Array() as Array<any>;
  mandatoryDataItems = new Array() as Array<any>;
  selectedItem: any;
  selectedItems = new Array() as Array<any>;
  contractId: number;
  toYear = new Date().getFullYear() + 5;
  uploadPath = environment.coreApiUrl + "/Uploading/File/Public/";
  viewOnly: boolean;
  pageMode = pageModes.NoAction;
  constructor(
    private _contractAttachmentsService: ContractAttachmentsService,
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.cols = [
      { field: "Id", header: "الرقم", hidden: true },
      { field: "DocumentId", header: "App.Fields.DocumentId", hidden: false },
      {
        field: "DocumentName",
        header: "App.Fields.DocumentName",
        hidden: false,
      },
      { field: "IsMandatory", header: "App.Fields.Type", hidden: false },
      // {
      //   field: "IsReceived",
      //   header: "Sales.Fields.ReceivingDone",
      //   hidden: true,
      // },
      {
        field: "Attachment",
        header: "App.Fields.Attachment",
        hidden: false,
      },
      { field: "ActionButtons", header: "", hidden: true },
    ];

    this.mandatoryCols = [
      { field: "Id", header: "الرقم", hidden: true },
      { field: "DocumentId", header: "App.Fields.DocumentId", hidden: false },
      {
        field: "DocumentName",
        header: "App.Fields.DocumentName",
        hidden: false,
      },
      { field: "IsReceived", header: "App.Fields.Status", hidden: false },
    ];
    this.getData();
  }

  createForm() {
    this.form = this._formBuilder.group({
      ContractId: [this.contractId, Validators.required],

      TrustReceipt: this._formBuilder.group({
        ContractDate: [{ value: "", disabled: true }],
        Id: [
          { value: "", disabled: this.pageMode !== pageModes.Edit },
          Validators.required,
        ],
        Date: [
          { value: "", disabled: this.pageMode !== pageModes.Edit },
          Validators.required,
        ],
        Amount: [
          { value: "", disabled: this.pageMode !== pageModes.Edit },
          [
            Validators.required,
            Validators.pattern("^0{0,}[1-9]+0*\\.{0,1}[0-9]*$"),
          ],
        ],
        DueDate: [
          { value: "", disabled: this.pageMode !== pageModes.Edit },
          Validators.required,
        ],
        ContractId: [
          { value: "", disabled: this.pageMode !== pageModes.Edit },
          Validators.required,
        ],
        IsReceived: [false],
      }),
      ContractDocuments: this._formBuilder.array([]),
    });
  }

  getData() {
    this.progressSpinner = true;
    this._activatedRoute.params.subscribe((params) => {
      this.contractId = Number(params["id"]);
      this._contractAttachmentsService
        .getAttachments(this.contractId)
        .subscribe(
          (result: IServiceResult) => {
            if (result.isSuccess) {
              this.viewModel = result.data;
              this.setPageMode(result.data.ContractActions);
              this.createForm();
              this.form.controls.ContractId.setValue(this.contractId);
              for (
                let i = 0;
                i < this.viewModel.ContractDocumentItemsVM.length;
                i++
              ) {
                if (!this.viewModel.EditMandatoryFields) {
                  if (!this.viewModel.ContractDocumentItemsVM[i].IsMandatory) {
                    this.addContractDocument(
                      this.viewModel.ContractDocumentItemsVM[i]
                    );
                    this.tempDataItems.push(
                      this.viewModel.ContractDocumentItemsVM[i]
                    );
                  } else {
                    this.mandatoryDataItems.push(
                      this.viewModel.ContractDocumentItemsVM[i]
                    );
                  }
                } else {
                  this.addContractDocument(
                    this.viewModel.ContractDocumentItemsVM[i]
                  );
                  this.tempDataItems.push(
                    this.viewModel.ContractDocumentItemsVM[i]
                  );
                }
                if (this.viewModel.ContractDocumentItemsVM[i].IsReceived) {
                  this.selectedItems.push(
                    this.viewModel.ContractDocumentItemsVM[i]
                  );
                }
              }
              this.dataItems = this.viewModel.ContractDocumentItemsVM;
              this.setFormValues();
            } else {
              this.form.disable();
            }
          },
          () => (this.progressSpinner = false),
          () => (this.progressSpinner = false)
        );
    });
  }

  setFormValues() {
    if (this.viewModel) {
      // Set Trust Receipt View
      if (this.viewModel.TrustReceiptVM) {
        this.form.patchValue({
          ContractId: this.contractId,

          TrustReceipt: {
            ContractDate: new Date(this.viewModel.ContractDate),
            Id: this.viewModel.TrustReceiptVM.Id,
            Date: new Date(this.viewModel.TrustReceiptVM.Date),
            Amount: this.viewModel.TrustReceiptVM.Amount,
            DueDate: new Date(this.viewModel.TrustReceiptVM.DueDate),
            ContractId: this.viewModel.TrustReceiptVM.ContractId,
            IsReceived: this.viewModel.TrustReceiptVM.IsReceived,
          },
        });

        if (!this.viewModel.EditMandatoryFields) {
          this.form.get("TrustReceipt").disable();
        }
      } else {
        this.form.patchValue({
          ContractId: this.contractId,
          TrustReceipt: {
            Id: 0,
            ContractDate: new Date(this.viewModel.ContractDate),

            ContractId: this.contractId,
          },
        });
      }
    }
  }

  setPageMode(actions: string) {
    if (actions.includes("attach-contract-documents,")) {
      this.pageMode = pageModes.Edit;
    } else if (actions.includes("attach-contract-documents-limited,")) {
      this.pageMode = pageModes.EditLimted;
    } else if (actions.includes(",can-view-attachment,")) {
      this.pageMode = pageModes.ViewOnly;
    }
  }
  addContractDocument(contractDocument: any) {
    (<FormArray>this.form.get("ContractDocuments")).push(
      this.addContractDocumentFormGroup(contractDocument)
    );
  }

  addContractDocumentFormGroup(contractDocument: any): FormGroup {
    return this._formBuilder.group({
      Id: [contractDocument.Id, Validators.required],
      ContractId: [contractDocument.ContractId, Validators.required],
      DocumentId: [contractDocument.DocumentId, Validators.required],
      IsReceived: [
        {
          value: contractDocument.IsReceived,
          disabled:
            this.pageMode === pageModes.ViewOnly ||
            (this.pageMode === pageModes.EditLimted &&
              contractDocument.IsMandatory),
        },
        Validators.required,
      ],
      Attachment: [contractDocument.Attachment],
      AttachmentId: [contractDocument.AttachmentId],
    });
  }

  getSelectedItem(vm: any, id: any) {
    if (id) {
      return vm.filter((x) => x.Id.toString() === id.toString())[0];
    }
    return null;
  }

  filterArray(event: any, arrayObject: any) {
    this.filteredArray = [];
    for (let i = 0; i < arrayObject.length; i++) {
      const item = arrayObject[i];
      if (
        item.ArabicName.toLowerCase().indexOf(event.query.toLowerCase()) >= 0 ||
        item.Id.toLowerCase().indexOf(event.query.toLowerCase()) >= 0
      ) {
        this.filteredArray.push(item);
      }
    }
  }

  onClear(controlName: string) {
    this.form.get("TrustReceipt").get(controlName).setValue(null);
  }

  updateContractDocumentReceivedStatus(
    group: FormGroup,
    documentId: string,
    isReceived: boolean
  ) {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormArray) {
        for (const control of abstractControl.controls) {
          if (documentId !== null) {
            if (control.value.DocumentId === documentId) {
              control.patchValue({
                IsReceived: isReceived,
              });
            }
          } else {
            control.patchValue({
              IsReceived: isReceived,
            });
          }
        }
      }
    });
  }

  onRowSelect(event: any) {
    this.updateContractDocumentReceivedStatus(
      this.form,
      event.data.DocumentId,
      true 
    );
  }

  onRowUnSelect(event: any) {
    this.updateContractDocumentReceivedStatus(
      this.form,
      event.data.DocumentId,
      false
    );
  }

  onHeaderCheckboxToggle(event: any) {
    this.updateContractDocumentReceivedStatus(this.form, null, event.checked);
  }

  save() {
    this.submitted = true;
    if (this.form.valid) {
      this.progressSpinner = true;
      const postedVM = this.form.getRawValue();
      console.log(postedVM)
       
      for (let index = 0; index < postedVM.ContractDocuments.length; index++) {
        postedVM.ContractDocuments[index]["Attachment"] = this.dataItems.find(
          (i) => i.DocumentId === postedVM.ContractDocuments[index].DocumentId
        )["Attachment"];
      }

      postedVM.TrustReceipt.Date = this._datePipe.transform(
        postedVM.TrustReceipt.Date
      );
      postedVM.TrustReceipt.DueDate = this._datePipe.transform(
        postedVM.TrustReceipt.DueDate
      );

      this._contractAttachmentsService.save(postedVM).subscribe(
        (result: IServiceResult) => {
          if (result.isSuccess) {
            this.submitted = false;
            // this.form.reset();
            this._router.navigate(["sales/list-contracts"]);
          }
        },
        null,
        () => (this.progressSpinner = false)
      );
    }
  }

  showReport() {
    this.reportchild.reportName = "Sales.Fields.ReceiptForOrder";
    this.reportchild.showReprot(
      6,
      `&Ds1_Filter1=And,Id,=,${this.viewModel.TrustReceiptVM.Id}`,
      false
    );
  }

  get pageModes() {
    return pageModes;
  }
}
