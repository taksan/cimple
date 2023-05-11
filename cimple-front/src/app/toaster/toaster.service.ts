import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {ToastMessage} from "./toast-message";

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  private toastSubject = new Subject<ToastMessage>()

  public toast = this.toastSubject.asObservable()
  constructor() { }

  public success(header: string, message: string): void {
    this.toastSubject.next(new ToastMessage(header, message))
  }

  public error(header: string, message: string): void {
    this.toastSubject.error(new ToastMessage(header, message))
  }

  subscribe(param: (t: ToastMessage) => void) {
    this.toast.subscribe(param)
  }

  subscribeError(param: (t: ToastMessage) => void) {
    this.toast.subscribe({
      error: param
    })
  }
}
