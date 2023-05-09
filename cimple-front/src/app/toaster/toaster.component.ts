import {Component} from '@angular/core';

@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss']
})
export class ToasterComponent {
  toasts: Toast[] = []

  success(header: string, message: string) {
    this.showToast(header, message, "success")
  }

  error(header: string, message: string) {
    this.showToast(header, message, "danger")
  }

  showToast(header: string, message: string, type: string) {
    this.toasts.push(new Toast(header, message, type))

    setTimeout(() => {
      this.toasts.shift()
    }, 5000);
  }

  toastClass(type: string) {
    return `cimple-alert alert alert-dismissible alert-${type}`
  }
}

class Toast {
  constructor(public header: string, public message: string, public type: string) {
  }
}
