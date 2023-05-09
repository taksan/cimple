import {Component, ViewChild} from '@angular/core';
import {ToasterComponent} from "./toaster/toaster.component";
import {ToasterService} from "./toaster/toaster.service";
import {ToastMessage} from "./toaster/toast-message";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('toaster') toaster: ToasterComponent | undefined;
  constructor(private toasterService: ToasterService) {
    toasterService.toast.subscribe({
        next: (toast: ToastMessage) => this.toaster?.success(toast.header, toast.message),
        error: (toast: ToastMessage) => this.toaster?.error(toast.header, toast.message)
    })
  }
}
