import { TestBed } from '@angular/core/testing';
import { ToasterService } from './toaster.service';
import { ToastMessage } from './toast-message';

describe('ToasterService', () => {
  let toasterService: ToasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToasterService],
    });
    toasterService = TestBed.inject(ToasterService);
  });

  it('should emit success toast', (done: Function) => {
    const header = 'Success';
    const message = 'Operation completed successfully';

    toasterService.subscribe((toast: ToastMessage) => {
      expect(toast.header).toBe(header);
      expect(toast.message).toBe(message);
      done();
    });

    toasterService.success(header, message);
  });

  it('should emit error toast', (done: Function) => {
    const header = 'Error';
    const message = 'An error occurred';

    toasterService.subscribe({
      error: (toast: ToastMessage)=> {
        expect(toast.header).toBe(header);
        expect(toast.message).toBe(message);
        done();
    }});

    toasterService.error(header, message);
  });
});
