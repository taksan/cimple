import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { Task } from './model/task';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve a list of tasks', () => {
    const mockTasks: Task[] = [
      new Task(null, 'Task 1', null, "", '10', '0.1'),
      new Task(null, 'Task 2', null, "", '10', '0.1')
    ];

    service.list().subscribe((tasks: Task[]) => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(mockTasks);
    });

    const request = httpMock.expectOne('http://localhost:8000/tasks');
    expect(request.request.method).toBe('GET');
    request.flush(mockTasks);
  });

  it('should create a new task', () => {
    const mockTask = new Task(null, 'Task 1', null, "", '10', '0.1')

    service.create(mockTask).subscribe((task: Task) => {
      expect(task).toEqual(mockTask);
    });

    const request = httpMock.expectOne('http://localhost:8000/tasks');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(mockTask);
    request.flush(mockTask);
  });

  it('should delete given task', () => {
    const mockTask = new Task("1", 'Task 1', null, "", '10', '0.1')

    service.delete(mockTask).subscribe(()=>{})

    const request = httpMock.expectOne('http://localhost:8000/tasks/1');
    expect(request.request.method).toBe('DELETE');
    request.flush(mockTask);
  });

  it('should update given new task', () => {
    const mockTask = new Task("1", 'Task 1', null, "", '10', '0.1')

    service.update(1, mockTask).subscribe((task: Task) => {
      expect(task).toEqual(mockTask);
    });

    const request = httpMock.expectOne('http://localhost:8000/tasks/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(mockTask);
    request.flush(mockTask);
  });
});
