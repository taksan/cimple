import {TestBed} from '@angular/core/testing';

import {BuildNotifierService} from './build-notifier.service';
import {TasksComponent} from "./tasks/tasks.component";
import {ToasterService} from "./toaster/toaster.service";

describe('BuildNotifierService', () => {
  let subject: BuildNotifierService;
  const toasterServiceMock = {
    success: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [TasksComponent],
      providers: [
        {provide: ToasterService, useValue: toasterServiceMock},
      ],
    }).compileComponents();
    subject = TestBed.inject(BuildNotifierService);

  });

  it('should invoke toaster with success for exit code 0', () => {
    subject.notifyBuildCompleted({
      type: "build_completed",
      message: "Success",
      details: {
        exitCode: 0
      }
    })
    expect(toasterServiceMock.success).toHaveBeenCalledWith("Build completed", "Success")
  });

  it('should invoke toaster with error for exit code != 0', () => {
    subject.notifyBuildCompleted({
      type: "build_completed",
      message: "Error",
      details: {
        exitCode: 127
      }
    })
    expect(toasterServiceMock.error).toHaveBeenCalledWith("Build completed", "Error")
  })

  it('should not invoke toaster if message is not of type build_completed', () => {
    subject.notifyBuildCompleted({
      type: "some stuff",
      message: "Error",
      details: null
    })
    expect(toasterServiceMock.success).not.toHaveBeenCalled()
    expect(toasterServiceMock.error).not.toHaveBeenCalled()
  })
});
