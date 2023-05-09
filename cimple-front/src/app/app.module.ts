import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {TasksComponent} from './tasks/tasks.component';
import {TaskEditorComponent} from './task-editor/task-editor.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ToasterComponent} from './toaster/toaster.component';
import {BuildsComponent} from './builds/builds.component';
import {AngularDateHttpInterceptorInterceptor} from "./utils/angular-date-http-interceptor.interceptor";

@NgModule({
  declarations: [
    AppComponent,
    TasksComponent,
    TaskEditorComponent,
    ToasterComponent,
    BuildsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AngularDateHttpInterceptorInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
