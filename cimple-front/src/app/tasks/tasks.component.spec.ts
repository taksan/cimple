import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TasksComponent} from './tasks.component';
import {TaskService} from "../task.service";
import {ToasterService} from "../toaster/toaster.service";
import {Router} from "@angular/router";
import {Task} from "../model/task";
import {of, throwError} from "rxjs";
import {DatePipe} from '@angular/common';
import {BuildNotifierService} from "../build-notifier.service";
import {WebSocketService} from "../web-socket.service";
import {WS} from "jest-websocket-mock";
import {MyIdService} from "../my-id.service";

describe('TasksComponent', () => {
  const clientId = 'my-client-id';
  let server: WS;
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;
  let taskService: TaskService;
  let toasterService: ToasterService;
  let webSocketService:WebSocketService;
  let buildNotifierMock: BuildNotifierService
  let myIdServiceSpy: jest.Mocked<MyIdService>;

  let router: Router;
  beforeEach(async () => {
    const taskServiceMock = {
      list: jest.fn(),
      trigger: jest.fn(),
      delete: jest.fn(),
    };

    const toasterServiceMock = {
      success: jest.fn(),
      error: jest.fn(),
    };

    server = new WS("ws://localhost:8000/ws");

    const myIdServiceSpyObj = {
      get: jest.fn()
    };
    myIdServiceSpy = myIdServiceSpyObj as unknown as jest.Mocked<MyIdService>;
    myIdServiceSpy.get.mockReturnValue(clientId);

    webSocketService = new WebSocketService(myIdServiceSpy)
    await server.connected

    buildNotifierMock = new BuildNotifierService(toasterServiceMock as unknown as ToasterService)
    buildNotifierMock.notifyBuildCompleted = jest.fn()


    const routerMock = {
      navigate: jest.fn(),
    };
    await TestBed.configureTestingModule({
      declarations: [TasksComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ToasterService, useValue: toasterServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: WebSocketService, useValue: webSocketService},
        { provide: BuildNotifierService, useValue: buildNotifierMock}
      ],
    }).compileComponents();
  });
  afterEach(() => {
    server.close()
    WS.clean()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService);
    toasterService = TestBed.inject(ToasterService);
    router = TestBed.inject(Router);
  });

  it('should display tasks returned by taskService', () => {
      const tasks: Task[] = [
        new Task(null, 'Task 1', null, null, '', '10', '0.1', new Date()),
        new Task(null, 'Task 2', null, null, '', '10', '0.1', new Date())
      ];
      jest.spyOn(taskService, 'list').mockReturnValue(of(tasks));

      component.updateTasks();
      fixture.detectChanges()

      let rows = fixture.nativeElement.querySelectorAll('table.task-list tbody > tr')
      expect(rows.length).toBe(2)

      const datePipe = new DatePipe('en-US');
      rows.forEach((row: any, index: number) => {
        const task = tasks[index];
        const nameCell = row.querySelector('[data-testid="task-name"]');
        const createdDateCell = row.querySelector('[data-testid="task-created-date"]');

        expect(nameCell.textContent).toContain(task.name);
        expect(createdDateCell.textContent).toContain(datePipe.transform(task.created, 'dd/MM/yy hh:mm'));
      });
    });

    it('should handle error and display toaster message', () => {
      const error = new Error('Failed to fetch tasks');
      jest.spyOn(taskService, 'list').mockReturnValue(throwError(()=> error));
      const errorSpy = jest.spyOn(toasterService, 'error');

      component.updateTasks();

      expect(errorSpy).toHaveBeenCalledWith('Failed fetch tasks', error.message);
    });

    it('should trigger task using taskService', () => {
      const tasks: Task[] = [
        new Task("1", 'Task 1', null, null, '', '10', '0.1'),
        new Task("2", 'Task 2', null, null, '', '10', '0.1')
      ];

      const successSpy = jest.spyOn(toasterService, 'success');
      jest.spyOn(taskService, 'list').mockReturnValue(of(tasks));
      let triggerSpy = jest.spyOn(taskService, 'trigger');
      triggerSpy.mockReturnValue(of({task: "Task 1", buildNumber: "0"}))
      component.updateTasks();
      fixture.detectChanges()

      fixture.nativeElement.querySelector('tr[data-testid="Task 1"] a[title="run"]').click()

      expect(triggerSpy).toHaveBeenCalledWith("1")
      expect(successSpy).toHaveBeenCalledWith('Task started', "Build #0 for task 'Task 1' started");
    });

    it('should invoke build notifier service when build completed message is received', async () => {
      // @ts-ignore
      await expect(server).toReceiveMessage(JSON.stringify({clientId: clientId}));
      jest.spyOn(taskService, 'list').mockReturnValue(of([]));
      fixture.detectChanges()

      let msg = {
        type: "build_completed",
        message: "Build #0 for task 'Task 1' completed",
        details: { build_id: 0, exit_code: 0}
      };
      server.send(JSON.stringify(msg))

      expect(buildNotifierMock.notifyBuildCompleted).toHaveBeenCalledWith(msg)
    })
});
