import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidateService } from 'src/app/_service/validate.service';
import { Utils } from 'src/app/common/helper';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';

const URL = {
  SAVE: "it0102/save",
  FIND_ID: "it0102/find_id"
}
@Component({
  selector: 'app-it0102detail',
  templateUrl: './it0102detail.component.html',
  styleUrls: ['./it0102detail.component.css']
})
export class It0102detailComponent implements OnInit {
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendar') calendar: InputCalendarComponent;
  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระการใช้บริการ IT อื่นๆ",
      link: "#",
    }
  ];

  formGroup: FormGroup;
  constructor(
    private fb: FormBuilder,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private validate: ValidateService
  ) {
    this.formGroup = this.fb.group({
      itOtherConfigId: [""],
      effectiveDate: ["", Validators.required],
      chargeRateType: ["", Validators.required],
      serviceType: ["", Validators.required],
      chargeRate: ["", Validators.required],
      remark: ["", Validators.required],
    })
  }

  // =================== initial setting ==================
  ngOnInit() {
    this.formGroup.get('itOtherConfigId').patchValue(this.route.snapshot.queryParams['itOtherConfigId']);
    if (Utils.isNotNull(this.formGroup.get('itOtherConfigId').value)) {
      this.findById();
    }
  }
  // ================ action =====================
  dateChange(event) {
    this.formGroup.get('effectiveDate').patchValue(event);
  }

  onBack() {
    this.router.navigate(["/it/it010"], {
      queryParams: {
        tab: 2
      }
    })
  }

  onValidBeforeSave() {
    let validateData = [
      { format: "", header: "วันที่มีผล", value: this.formGroup.get("effectiveDate").value },
      { format: "", header: "ประเภทอัตราค่าภาระ", value: this.formGroup.get("chargeRateType").value },
      { format: "", header: "ประเภท", value: this.formGroup.get("serviceType").value },
      { format: "", header: "อัตราค่าภาระ", value: this.formGroup.get("chargeRate").value },
      { format: "", header: "หมายเหตุ", value: this.formGroup.get("remark").value }
    ];
    if (this.validate.checking(validateData)) {
      if (this.formGroup.invalid) {
        this.modalError.openModal(MessageService.MSG.REQUIRE_FIELD);
      } else {
        this.modalSave.openModal();
      }
    }
  }
  // ======================== call back-end ====================
  callSave() {
    this.commonService.loading();
    // console.log("formGroup => ", this.formGroup.value);
    this.ajax.doPost(URL.SAVE, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal();
        this.onBack();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  findById() {
    this.commonService.loading();
    this.ajax.doPost(URL.FIND_ID, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formGroup.get('itOtherConfigId').patchValue(res.data.itOtherConfigId);
        this.formGroup.get('effectiveDate').patchValue(res.data.effectiveDate);
        this.calendar.setDate(this.formGroup.get('effectiveDate').value);
        this.formGroup.get('chargeRateType').patchValue(res.data.chargeRateType);
        this.formGroup.get('serviceType').patchValue(res.data.serviceType);
        this.formGroup.get('chargeRate').patchValue(res.data.chargeRate);
        this.formGroup.get('remark').patchValue(res.data.remark);
      } else {
        this.modalError.openModal(res.message);
        this.onBack();
      }
      this.commonService.unLoading();
    })
  }

}
