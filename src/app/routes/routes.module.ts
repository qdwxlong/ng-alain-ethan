import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { RouteRoutingModule } from './routes-routing.module';
// dashboard pages
import { HomeComponent } from './home/home.component';
// passport pages
import { UserLoginComponent } from './passport/login/login.component';
// single pages
import { Exception403Component } from './exception/403.component';
import { Exception404Component } from './exception/404.component';
import { Exception500Component } from './exception/500.component';


const COMPONENTS = [
  HomeComponent,
  // passport pages
  UserLoginComponent,
  // single pages
  Exception403Component,
  Exception404Component,
  Exception500Component
];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [SharedModule, RouteRoutingModule],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class RoutesModule { }
