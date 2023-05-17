import {Component, ViewChild} from '@angular/core';
import {ToasterComponent} from "./toaster/toaster.component";
import {ToasterService} from "./toaster/toaster.service";
import {ToastMessage} from "./toaster/toast-message";
import {MyIdService} from "./my-id.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('toaster') toaster: ToasterComponent | undefined;
  public clientId: string
  constructor(private toasterService: ToasterService, private myId: MyIdService) {
    toasterService.toast.subscribe({
        next: (toast: ToastMessage) => this.toaster?.success(toast.header, toast.message),
        error: (toast: ToastMessage) => this.toaster?.error(toast.header, toast.message)
    })
    this.clientId = myId.get()
  }
  logout() {
    this.myId.logout()
    window.location.reload()
  }
}
