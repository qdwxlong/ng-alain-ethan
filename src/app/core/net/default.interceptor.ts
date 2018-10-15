import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse, HttpSentEvent, HttpHeaderResponse, HttpProgressEvent, HttpResponse, HttpUserEvent } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';

/**
 * 默认HTTP拦截器，其注册细节见 `app.module.ts`
 */
@Injectable()
export class DefaultInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) { }

  get msg(): NzMessageService {
    return this.injector.get(NzMessageService);
  }

  private goTo(url: string) {
    setTimeout(() => this.injector.get(Router).navigateByUrl(url));
  }

  private handleData(event: HttpResponse<any> | HttpErrorResponse): Observable<any> {
    // 可能会因为 `throw` 导出无法执行 `_HttpClient` 的 `end()` 操作
    this.injector.get(_HttpClient).end();
    // 业务处理：一些通用操作
    switch (event.status) {
      case 200:
        if (event instanceof HttpResponse) {
          const body: any = event.body;
          if (body == null) {
            return of(event.clone({ body: null }));// 无异常，处理之后只返回value部分（{errCode: number, errMsg: string, value: any}转化为value: any）
          } else if (body.errCode !== 0) {
            if (body.errCode === 401) {// 未登录
              this.goTo('/passport/login');
            } else {// 无权限或其他异常
              this.msg.error(body.errMsg);
              return throwError({});
            }
          } else {
            return of(event.clone({ body: body.value }));// 无异常，处理之后只返回value部分（{errCode: number, errMsg: string, value: any}转化为value: any）
          }
        }
        break;
      case 401: // 未登录状态码
        this.goTo('/passport/login');
        break;
      case 403:
        this.msg.error('您没有权限访问此信息');
        return throwError({});
      case 404:
        this.msg.error('您访问的页面不存在');
        return throwError({});
      case 500:
        this.msg.error('未知错误');
        return throwError({});
      default:
        if (event instanceof HttpErrorResponse) {
          console.warn('未知错误', event);
          this.msg.error('未知错误');
        }
        return throwError({});
    }
    return of(event);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
    // 统一加上服务端前缀
    let url = req.url;
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      url = environment.SERVER_URL + url;
    }
    const newReq = req.clone({
      url: url,
    });
    return next.handle(newReq).pipe(
      mergeMap((event: any) => {
        // 允许统一对请求错误处理，这是因为一个请求若是业务上错误的情况下其HTTP请求的状态是200的情况下需要
        if (event instanceof HttpResponse && event.status === 200)
          return this.handleData(event);
        // 若一切都正常，则后续操作
        return of(event);
      }),
      catchError((err: HttpErrorResponse) => this.handleData(err)),
    );
  }
}
