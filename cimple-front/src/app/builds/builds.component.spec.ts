import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BuildsComponent } from './builds.component';
import { TaskService } from '../task.service';
import { ToasterService } from '../toaster/toaster.service';
import { of, throwError } from 'rxjs';
import { Task } from '../model/task';
import { Build } from '../model/build';
import {By} from "@angular/platform-browser";
import {DatePipe} from '@angular/common';

describe('BuildsComponent', () => {
  let component: BuildsComponent;
  let fixture: ComponentFixture<BuildsComponent>;
  let taskService: jest.Mocked<TaskService>;
  let toasterService: jest.Mocked<ToasterService>;

  beforeEach(() => {
    const taskServiceMock = {
      get: jest.fn(),
    };
    const toasterServiceMock = {
      error: jest.fn(),
    };

    TestBed.configureTestingModule({
      declarations: [BuildsComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ToasterService, useValue: toasterServiceMock },
        { provide: ActivatedRoute, useValue: { params: of({ id: 1 }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BuildsComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as jest.Mocked<TaskService>;
    toasterService = TestBed.inject(ToasterService) as jest.Mocked<ToasterService>;
  });

  it('should initialize component and load task', () => {
    const mockTask: Task = new Task(null, '1', 'Task 1', null, "", '10', '0.1');

    taskService.get.mockReturnValue(of(mockTask));

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.currentTask).toEqual(mockTask);
    expect(taskService.get).toHaveBeenCalledWith(1);
  });

  it('should handle error when loading task', () => {
    const errorMessage = 'Failed to load task builds';

    taskService.get.mockReturnValue(throwError(() => new Error(errorMessage)));

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(toasterService.error).toHaveBeenCalledWith(errorMessage, errorMessage);
  });

  it('should display build output when a build is selected', () => {
    const task: Task = new Task(null, 'Task 1', null, null, '', '10', '0.1');
    const build: Build = {
      created: undefined, exit_code: undefined, status: "", task_id: undefined,
      id: 1,
      finished: new Date(),
      output: 'output',
      started_by: '',
      execStatus: () => 'succeeded'
    };

    // Set the currentTask and selectedBuild
    component.currentTask = task;
    component.selectedBuild = build;

    fixture.detectChanges();

    // Get the pre element containing the build output
    const buildOutput = fixture.debugElement.query(By.css('pre.terminal')).nativeElement;

    // Assert the build output is correctly displayed
    expect(buildOutput.textContent).toContain('output');
  });

  it('should return the correct class for a build', () => {
    const mockBuild1: Build = new Build();
    const mockBuild2: Build = new Build();
    const mockBuild3: Build = new Build();

    mockBuild1.exit_code = null;
    mockBuild2.exit_code = 0;
    mockBuild3.exit_code = 1;

    expect(component.classFor(mockBuild1)).toBe('selectable table-info');
    expect(component.classFor(mockBuild2)).toBe('selectable table-success');
    expect(component.classFor(mockBuild3)).toBe('selectable table-danger');
  });

  it('should render task builds correctly', () => {
    const task: Task = new Task("1", 'Task 1', null, null, '', '10', '0.1');

    const builds: Build[] = [
      {
        id: 1,
        finished: new Date(),
        output: 'output 1',
        execStatus: () => 'succeeded',
        created: undefined, exit_code: undefined, status: "", task_id: 1, started_by: ''
      },
      {
        id: 2,
        finished: new Date(),
        output: 'output 2',
        execStatus: () => 'failed',
        created: undefined, exit_code: undefined, status: "", task_id: 1, started_by: ''
      },
    ];

    // Set the currentTask and builds
    component.currentTask = task;
    task.builds = builds;

    fixture.detectChanges();

    // Get the table rows
    const rows = fixture.debugElement.queryAll(By.css('tbody > tr'));

    expect(rows.length).toBe(builds.length); // Ensure correct number of rows

    const datePipe = new DatePipe('en-US');
    // Assert the build details in each row
    rows.forEach((row, index) => {
      const build = builds[index];
      const buildColumns = row.queryAll(By.css('td'));

      // Assert the build number
      const buildNumberColumn = buildColumns[0].nativeElement;
      expect(buildNumberColumn.textContent).toContain(`# ${build.id}`);

      // Assert the build date
      const buildDateColumn = buildColumns[1].nativeElement;
      expect(buildDateColumn.textContent).toContain(datePipe.transform(build.finished, 'dd/MM/yy hh:mm'));

      // Assert the build status
      const buildStatusColumn = buildColumns[2].nativeElement;
      expect(buildStatusColumn.textContent).toContain(build.execStatus());
    });
  });
});
