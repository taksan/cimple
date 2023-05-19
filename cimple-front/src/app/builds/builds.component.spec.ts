import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router';
import {BuildsComponent} from './builds.component';
import {TaskService} from '../task.service';
import {ToasterService} from '../toaster/toaster.service';
import {of, throwError} from 'rxjs';
import {Task} from '../model/task';
import {Build} from '../model/build';
import {By} from "@angular/platform-browser";
import {DatePipe} from '@angular/common';
import {WebSocketService} from "../web-socket.service";
import {WS} from "jest-websocket-mock";
import {MyIdService} from "../my-id.service";
import {BuildNotifierService} from "../build-notifier.service";
import {AvatarComponent} from "../avatar/avatar.component";

describe('BuildsComponent', () => {
  let component: BuildsComponent;
  let fixture: ComponentFixture<BuildsComponent>;
  let taskService: jest.Mocked<TaskService>;
  let toasterService: jest.Mocked<ToasterService>;
  let server: WS;
  let webSocketService: WebSocketService;
  let buildNotifierMock: BuildNotifierService

  beforeEach(async () => {
    server = new WS("ws://localhost:8000/ws");

    const clientId = 'my-client-id';
    const myIdServiceSpy = {
      get: () => clientId
    } as unknown as MyIdService
    webSocketService = new WebSocketService(myIdServiceSpy)
    await server.connected

    const taskServiceMock = {
      get: jest.fn(),
      trigger: jest.fn()
    };
    const toasterServiceMock = {
      error: jest.fn(),
    };

    buildNotifierMock = new BuildNotifierService(toasterServiceMock as unknown as ToasterService)
    buildNotifierMock.notifyBuildCompleted = jest.fn()

    await TestBed.configureTestingModule({
      declarations: [BuildsComponent, AvatarComponent],
      providers: [
        {provide: TaskService, useValue: taskServiceMock},
        {provide: ToasterService, useValue: toasterServiceMock},
        {provide: ActivatedRoute, useValue: {params: of({id: 1})}},
        {provide: WebSocketService, useValue: webSocketService},
        {provide: BuildNotifierService, useValue: buildNotifierMock}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BuildsComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as jest.Mocked<TaskService>;
    toasterService = TestBed.inject(ToasterService) as jest.Mocked<ToasterService>;
  });

  afterEach(() => {
    WS.clean()
    server.close()
  })

  it('should initialize component and load task', () => {
    const mockTask: Task = new Task(null, '1', 'Task 1', null, "", '10', '0.1');

    taskService.get.mockReturnValue(of(mockTask));

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.currentTask).toEqual(mockTask);
    expect(taskService.get).toHaveBeenCalledWith("1");
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
    const build: Build = oneBuild(1, 'output 1', 'succeeded')

    // Set the currentTask and selectedBuild
    component.currentTask = task;
    component.selectedBuild = build;

    fixture.detectChanges();

    // Get the pre element containing the build output
    const buildOutput = fixture.debugElement.query(By.css('pre.terminal')).nativeElement;

    // Assert the build output is correctly displayed
    expect(buildOutput.textContent).toContain('output');
    let buildInfo = fixture.nativeElement.querySelector("[data-testid='build-info']").textContent
    let datePipe = new DatePipe("en-US")
    expect(buildInfo).toContain("Started by: Shelly")
    expect(buildInfo).toContain("Build started: " + datePipe.transform(build.created, 'dd/MM/yy hh:mm'));
    expect(buildInfo).toContain("Finished: " + datePipe.transform(build.finished, 'dd/MM/yy hh:mm'));
    expect(buildInfo).toContain("Elapsed: 20000 ms");
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
    const task: Task = oneTask();

    const builds: Build[] = [
      oneBuild(1, 'output 1', 'succeeded'),
      oneBuild(2, 'output 2', 'failed')
    ]

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
    })
  })

  it('should trigger a new build', () => {
    const task: Task = oneTask();

    const builds: Build[] = [ oneBuild(1, 'output 1', 'succeeded') ]

    // Set the currentTask and builds
    component.currentTask = task;
    task.builds = builds;

    fixture.detectChanges();

    // Get the table rows
    let runButton = fixture.debugElement.query(By.css('[data-testid="run-button"]')).nativeElement;
    runButton.click()
    expect(taskService.trigger).toHaveBeenCalledWith("1");
  });

  it('should update the builds when a build completes', async () => {
    // @ts-ignore
    await expect(server).toReceiveMessage(JSON.stringify({clientId: 'my-client-id'}));

    const task: Task = oneTask();
    const builds: Build[] = [ oneBuild(1, 'output 1', 'succeeded') ]

    // Set the currentTask and builds
    component.currentTask = task;
    task.builds = builds;
    fixture.detectChanges();
    const now = new Date()

    let thisBuild = {
      type: "build_completed",
      message: "Build #2 for task 'Task 1' completed",
      details: {id: 2, exit_code: 127, task_id: 1, finished: now.toISOString()}
    };
    server.send(JSON.stringify(thisBuild))

    let notThisBuild = {
      type: "build_completed",
      message: "Build #2 for task 'Some other task' completed",
      details: new Build({id: 2, exit_code: 127, task_id: 2})
    };
    server.send(JSON.stringify(notThisBuild))
    // @ts-ignore
    thisBuild.details.finished = now
    // @ts-ignore
    expect(buildNotifierMock.notifyBuildCompleted.mock.calls).toEqual([[thisBuild]])

    fixture.detectChanges();
    const build1 = fixture.debugElement.query(By.css('tr[data-testid="build-2"]')).nativeElement;
    expect(build1.querySelector("[data-testid='status']").textContent.trim()).toBe("failed");
    expect(build1.classList).toContain("flash")
    if (!component.currentTask) throw new Error("currentTask should not be null")
    if (!component.currentTask.builds) throw new Error("component.currentTask.builds should not be null")
    let addedBuild = component.currentTask.builds[component.currentTask.builds.length-1]
    expect(addedBuild.id).toBe(2)
    expect(addedBuild.exit_code).toBe(127)
    expect(addedBuild.task_id).toBe(1)
    expect(addedBuild.finished).toEqual(now)
    expect(addedBuild.execStatus()).toBe("failed")
  });

  function oneTask() {
    return new Task("1", 'Task 1', null, null, '', '10', '0.1')
  }
  function oneBuild(id: number, output: string, execStatus: "running" | "succeeded" | "failed") : Build {
    let created = new Date()
    let finished = new Date(created.getTime() + 20000)
    return new Build({
        id: id,
        created: created,
        finished: finished,
        output: output,
        exit_code: undefined,
        status: "",
        task_id: 1,
        started_by: 'Shelly',
        execStatus: () => execStatus
    })
  }
});
