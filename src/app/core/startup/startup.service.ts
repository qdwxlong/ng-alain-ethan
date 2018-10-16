import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { zip } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MenuService, SettingsService, TitleService } from '@delon/theme';
import { ACLService } from '@delon/acl';

/**
 * 用于应用启动时
 * 一般用来获取应用所需要的基础数据等
 */
@Injectable()
export class StartupService {
  constructor(
    private menuService: MenuService,
    private settingService: SettingsService,
    private aclService: ACLService,
    private titleService: TitleService,
    private httpClient: HttpClient
  ) { }

  private viaHttp(resolve: any, reject: any) {
    zip(
      this.httpClient.get('/security/user')
    ).pipe(
      // 接收其他拦截器后产生的异常消息
      catchError(([appData]) => {
        resolve(null);
        return [appData];
      })
    ).subscribe(([appData]) => {
      this.init(appData);
    },
      () => { },
      () => {
        resolve(null);
      });
  }

  init(data) {
    let systemInfo: any = data.systemInfo;
    if (systemInfo == null) {
      systemInfo = { title: "信海平台" };
    }
    const menu: any = [{
      group: true,
      link: '/welcome',
      children: data.menus
    }];
    const app: any = {
      name: systemInfo.title,
      description: systemInfo.title
    };
    const user: any = {
      name: data.name,
      avatar: data.icon,
      email: data.email
    };
    // 应用信息：包括站点名、描述、年份
    this.settingService.setApp(app);
    // 用户信息：包括姓名、头像、邮箱地址
    this.settingService.setUser(user);
    // ACL：设置权限为全量
    this.aclService.setFull(true);
    // 初始化菜单
    this.menuService.add(menu);
    // 设置页面标题的后缀
    this.titleService.suffix = systemInfo.title;
  }

  load(): Promise<any> {
    // only works with promises
    // https://github.com/angular/angular/issues/15088
    return new Promise((resolve, reject) => {
      // http
      this.viaHttp(resolve, reject);
    });
  }
}
