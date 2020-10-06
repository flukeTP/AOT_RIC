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
  SAVE: "communi0061/save",
  FIND_ID: "communi0061/find_id"
}
@Component({
  selector: 'app-communi0061detail',
  templateUrl: './communi0061detail.component.html',
  styleUrls: ['./communi0061detail.component.css']
})
export class Communi0061detailComponent implements OnInit {
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendar') calendar: InputCalendarComponent;
  breadcrumb: any = [
    {
      label: "หมวดสื่อสาร",
      link: "/home/communi",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระการใช้บริการสื่อสาร",
      link: "/home/communi",
    },
    {
      label: "กำหนดอัตราค่าภาระ การใช้วิทยุมือถือ",
      link: "#",
    },

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
      commuTransceiverConfigId: [""],
      effectiveDate: ["", Validators.required],
      serviceType: ["", Validators.required],
      chargeRateName: ["", Validators.required],
      chargeRate: ["", Validators.required],
      insuranceFee: ["", Validators.required],
      remark: ["", Validators.required],
    })
  }

  // =================== initial setting ==================
  ngOnInit() {
    this.formGroup.get('commuTransceiverConfigId').patchValue(this.route.snapshot.queryParams['commuTransceiverConfigId']);
    if (Utils.isNotNull(this.formGroup.get('commuTransceiverConfigId').value)) {
      this.findById();
    }
  }
  // ================ action =====================
  dateChange(event) {
    this.formGroup.get('effectiveDate').patchValue(event);
  }

  onBack() {
    this.router.navigate(["/communi/communi006"], {
      queryParams: {
        tab: 1
      }
    })
  }

  onValidBeforeSave() {
    let validateData = [
      { format: "", header: "วันที่มีผล", value: this.formGroup.get("effectiveDate").value },
      // { format: "", header: "ประเภท", value: this.formGroup.get("serviceType").value },
      // { format: "", header: "ชื่ออัตราค่าภาระ", value: this.formGroup.get("chargeRateName").value },
      { format: "", header: "อัตราค่าภาระ", value: this.formGroup.get("chargeRate").value },
      { format: "", header: "ค่าประกัน", value: this.formGroup.get("insuranceFee").value },
      { format: "", header: "หมายเหตุ", value: this.formGroup.get("remark").value }
    ];
    // if (this.validate.checking(validateData)) {
    //   if (this.formGroup.invalid) {
    //     this.modalError.openModal(MessageService.MSG.REQUIRE_FIELD);
    //   } else {
    //     this.modalSave.openModal();
    //   }
    // }
    if (!this.validate.checking(validateData)) {
      return;
    }
    this.modalSave.openModal();
  }
  // ======================== call back-end ====================
  callSave() {
    this.ajax.doPost(URL.SAVE, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal();
        this.onBack();
      } else {
        this.modalError.openModal(res.message);
      }
    });
  }

  findById() {
    this.commonService.loading();
    this.ajax.doPost(URL.FIND_ID, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formGroup.get('commuTransceiverConfigId').patchValue(res.data.commuTransceiverConfigId);
        this.formGroup.get('effectiveDate').patchValue(res.data.effectiveDate);
        this.calendar.setDate(this.formGroup.get('effectiveDate').value);
        this.formGroup.get('serviceType').patchValue(res.data.serviceType);
        this.formGroup.get('chargeRateName').patchValue(res.data.chargeRateName);
        this.formGroup.get('chargeRate').patchValue(res.data.chargeRate);
        this.formGroup.get('insuranceFee').patchValue(res.data.insuranceFee);
        this.formGroup.get('remark').patchValue(res.data.remark);
      } else {
        this.modalError.openModal(res.message);
        this.onBack();
      }
      this.commonService.unLoading();
    })
  }

}
