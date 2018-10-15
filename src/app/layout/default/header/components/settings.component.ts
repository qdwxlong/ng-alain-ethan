import { Component, HostListener } from '@angular/core';
import * as screenfull from 'screenfull';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'header-settings',
  template: `
    <nz-dropdown nzTrigger="click" nzPlacement="bottomRight">
      <div class="item" nz-dropdown>
        <i class="anticon anticon-setting"></i>
      </div>
      <div nz-menu style="width:200px;">
        <div nz-menu-item (click)="fullscreen()">
          <i class="anticon anticon-{{status ? 'shrink' : 'arrows-alt'}}"></i> {{ status ? '退出全屏' : '全屏' }}
        </div>
        <div nz-menu-item (click)="storage()">
          <i class="anticon anticon-tool"></i> 清除本地缓存
        </div>
      </div>
    </nz-dropdown>
  `
})
export class SettingsComponent {
  status = false;
  constructor(private confirmServ: NzModalService, private messageServ: NzMessageService) { }

  @HostListener('window:resize')
  _resize() {
    this.status = screenfull.isFullscreen;
  }

  fullscreen() {
    if (screenfull.enabled) {
      screenfull.toggle();
    }
  }

  storage() {
    this.confirmServ.confirm({
      nzTitle: '确定要清除所有本地缓存吗？',
      nzOnOk: () => {
        localStorage.clear();
        this.messageServ.success('清除完成!');
      }
    });
  }
}
