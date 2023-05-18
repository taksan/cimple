import { Injectable } from '@angular/core';
import {Message} from "./web-socket.service";
import {ToasterService} from "./toaster/toaster.service";

@Injectable({
  providedIn: 'root'
})
export class BuildNotifierService {

  constructor(private toaster: ToasterService) { }


  notifyBuildCompleted(message: Message) {
    if (message.type != "build_completed") return
    if (message.details.exit_code == 0)
      this.toaster.success("Build completed", message.message)
    else
      this.toaster.error("Build completed", message.message)
  }
}
