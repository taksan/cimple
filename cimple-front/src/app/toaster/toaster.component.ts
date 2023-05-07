import { Component } from '@angular/core';

@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss']
})
export class ToasterComponent {
  header: string = "";
  message: string = ""
  show: boolean = false;

  showToast(header: string, message: string) {
    this.header = header;
    this.message = message;
    this.show = true;
    setTimeout(() => {
        this.show = false;
    }, 5000);
  }
  toastClass() {
    return `toast ${this.show?'show':''}`
  }
}
