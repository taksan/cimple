import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TaskEditorComponent} from './task-editor.component';
import {TaskService} from "../task.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToasterService} from "../toaster/toaster.service";
import {of} from "rxjs";
import {ReactiveFormsModule} from "@angular/forms";
import {Task} from "../model/task";

describe('TaskCreateComponent', () => {
  let component: TaskEditorComponent;
  let fixture: ComponentFixture<TaskEditorComponent>;
  let taskService: TaskService;
  let router: Router;
  let toaster: ToasterService;
  let activatedRoute: ActivatedRoute;

  beforeEach(async () => {
    const taskServiceMock = {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const routerMock = {
      navigate: jest.fn(),
    };

    const toasterMock = {
      error: jest.fn(),
    };

    const activatedRouteMock = {
      params: of({}),
    };

    await TestBed.configureTestingModule({
      declarations: [TaskEditorComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ToasterService, useValue: toasterMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskEditorComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService);
    router = TestBed.inject(Router);
    toaster = TestBed.inject(ToasterService);
    activatedRoute = TestBed.inject(ActivatedRoute);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set title to "Task Creation" by default', () => {
      fixture.detectChanges();
      expect(component.title).toBe('Task Creation');
    });

    it('should set title to "Task Update" and load task data when id is provided in route params', () => {
      const taskId = 1;
      const task: Task = new Task("1", 'Test task', '', 'echo "Hello, world!"', '50', '0.1');
      jest.spyOn(taskService, 'get').mockReturnValue(of(task));
      activatedRoute.params = of({ id: taskId });

      fixture.detectChanges();

      expect(component.title).toBe('Task Update');
      expect(component.currentTaskId).toBe(taskId);
      expect(component.taskForm.get('name')?.value).toBe(task.name);
      expect(component.taskForm.get('image')?.value).toBe(task.image);
      expect(component.taskForm.get('schedule')?.value).toBe(task.schedule);
      expect(component.taskForm.get('script')?.value).toBe(task.script);
      expect(component.taskForm.get('memory')?.value).toBe(task.memory);
      expect(component.taskForm.get('cpu')?.value).toBe(task.cpu);
      expect(taskService.get).toHaveBeenCalledWith(taskId);
    });
  });

  describe('onSubmit', () => {
    it('should do nothing if task form is invalid', () => {
      fixture.detectChanges();
      component.taskForm.setErrors({invalid: true});

      component.onSubmit();

      expect(taskService.create).not.toHaveBeenCalled();
      expect(taskService.update).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  })
});
