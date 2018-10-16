import { Component, OnDestroy, Inject, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { ReuseTabService } from '@delon/abc';
import { StartupService } from '@core/startup/startup.service';
import { _HttpClient } from '@delon/theme';
import { MD5Utils } from '@shared/md5/md5';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [],
})
export class UserLoginComponent {
  form: FormGroup;
  jcaptchaUrl = "/jcaptcha.jpg";
  jcaptchaSrc = this.jcaptchaUrl + "?t=" + new Date().getTime();

  constructor(
    fb: FormBuilder,
    private router: Router,
    public msg: NzMessageService,
    private modalSrv: NzModalService,
    public http: _HttpClient,
    private md5Utils: MD5Utils,
    @Optional()
    @Inject(ReuseTabService)
    private reuseTabService: ReuseTabService,
    private startupSrv: StartupService,
  ) {
    this.form = fb.group({
      userName: [localStorage.getItem("username"), [Validators.required]],
      password: [localStorage.getItem("password"), Validators.required],
      captcha: [null, Validators.required],
      remember: [localStorage.getItem("username") != null],
    });
    modalSrv.closeAll();
  }

  get userName() {
    return this.form.controls.userName;
  }
  get password() {
    return this.form.controls.password;
  }
  get captcha() {
    return this.form.controls.captcha;
  }
  get remember() {
    return this.form.controls.remember;
  }
  refreshCaptcha() {
    this.jcaptchaSrc = this.jcaptchaUrl + "?t=" + new Date().getTime();
  }

  submit() {
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }
    if (this.form.valid) {
      let jCaptchaCode = "";
      if (this.captcha.value != null) {
        jCaptchaCode = this.captcha.value
      }
      let user: any = {
        username: this.userName.value,
        password: this.md5Utils.hex_md5(
          this.md5Utils.hex_md5(
            this.md5Utils.hex_md5(this.password.value).toString() +
            this.userName.value
          ).toString() + jCaptchaCode.toUpperCase()
        ),
        jCaptchaCode: jCaptchaCode
      };
      this.http.post(`/security/login?jCaptchaCode=${jCaptchaCode}`, user).subscribe(
        (data: any) => {
          this.refreshCaptcha();
          // 清空路由复用信息
          this.reuseTabService.clear();
          if (this.remember.value) {
            localStorage.setItem("username", this.userName.value);
            localStorage.setItem("password", this.password.value);
          } else {
            localStorage.removeItem("username");
            localStorage.removeItem("password");
          }
          this.startupSrv.init(data);
          this.router.navigateByUrl("/");
        },
        error => {
          this.refreshCaptcha();
        },
        () => {
          this.refreshCaptcha();
        }
      );
    }
  }

}
