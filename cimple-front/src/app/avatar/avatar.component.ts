import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent {
  @Input() public who: string = ""
  @Input() public titlePattern: string = ""
  @Input() public size: number = 64

  public title() {
    return this.titlePattern.replace("{WHO}", this.who)
  }
}
