import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarComponent } from './avatar.component';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AvatarComponent]
    });
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.who = "Allanon"
    component.size = 24;
    component.titlePattern = "It's {WHO}"
    fixture.detectChanges()

    let img = fixture.nativeElement.querySelector("img")
    expect(img.alt).toEqual("Allanon")
    expect(img.width).toEqual(24)
    expect(img.height).toEqual(24)
    expect(img.title).toEqual("It's Allanon")
  });
});
