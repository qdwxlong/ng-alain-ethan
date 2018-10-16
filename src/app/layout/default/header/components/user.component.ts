import { Component } from '@angular/core';
import { SettingsService, _HttpClient } from '@delon/theme';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'header-user',
  template: `
  <nz-dropdown nzPlacement="bottomRight">
    <div class="alain-default__nav-item d-flex align-items-center px-sm" nz-dropdown>
      <nz-avatar [nzSrc]="settings.user.avatar" nzSize="small" class="mr-sm"></nz-avatar>
      {{settings.user.name}}
    </div>
    <div nz-menu class="width-sm">
      <div nz-menu-item (click)="logout()"><i class="anticon anticon-setting mr-sm"></i>退出登录</div>
    </div>
  </nz-dropdown>
  `,
})
export class HeaderUserComponent {
  constructor(private _http: _HttpClient, private router: Router, private _message: NzMessageService, public settings: SettingsService) { }

  logout() {
    this._http.get(`/security/logout`).subscribe(
      data => {
        this.router.navigateByUrl(`/passport/login`);
      },
      error => {
        this._message.error("退出系统失败")
      }
    );
  }
}
