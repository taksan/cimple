import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToasterComponent } from './toaster.component';

describe('ToasterComponent', () => {
  let component: ToasterComponent;
  let fixture: ComponentFixture<ToasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToasterComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display success toast', fakeAsync(() => {
    const header = 'Success';
    const message = 'Operation completed successfully';

    component.success(header, message);
    fixture.detectChanges();

    const toastElement = fixture.nativeElement.querySelector('.cimple-alert');
    expect(toastElement.classList).toContain('alert-success');
    expect(toastElement.innerHTML).toContain(header);
    expect(toastElement.innerHTML).toContain(message);
    tick(5000)
  }));

  it('should display error toast', fakeAsync(() => {
    const header = 'Error';
    const message = 'An error occurred';

    component.error(header, message);
    fixture.detectChanges();
    tick(5000);

    const toastElement = fixture.nativeElement.querySelector('.cimple-alert');
    expect(toastElement.classList).toContain('alert-danger');
    expect(toastElement.innerHTML).toContain(header);
    expect(toastElement.innerHTML).toContain(message);
  }));

  it('should display and remove multiple toasts after timeout', fakeAsync(() => {
    const toasts = [
      { header: 'Toast 1', message: 'This is toast 1' },
      { header: 'Toast 2', message: 'This is toast 2' },
      { header: 'Toast 3', message: 'This is toast 3' },
    ];

    toasts.forEach((toast) =>
      component.showToast(toast.header, toast.message, 'success'));
    fixture.detectChanges();

    fixture.nativeElement.querySelectorAll(`.cimple-alert`).forEach((toastElement:any, index:number) => {
      expect(toastElement.innerHTML).toContain(toasts[index].header)
    });

    tick(15000); // Advance the time by the timeout duration (5 seconds)
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll(`.cimple-alert`).length).toBe(0)
  }));
});
