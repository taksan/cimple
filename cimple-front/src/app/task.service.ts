import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Task} from "./model/task";
import {map, Observable} from "rxjs";
import {TaskBuildResponse} from "./model/task-build-response";
import {TaskDeleteResponse} from "./model/task-delete-response";
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient) { }

  public list(): Observable<Task[]> {
    return this.http.get<Map<string, Task>>(`${environment.backendUrl}/tasks`)
      .pipe(
        map(m => Object.values(m)),
        map(m => m.map(t => Task.from(t)))
      )
  }

  public create(task: Task): Observable<Task> {
    return this.http.post<Task>(`${environment.backendUrl}/tasks`, task)
      .pipe(map(t => Task.from(t)))
  }

  public get(id: string) {
    return this.http.get<Task>(`${environment.backendUrl}/tasks/${id}`)
      .pipe(map(t => Task.from(t)))
  }

  public update(id: string, task: Task): Observable<Task> {
    return this.http.put<Task>(`${environment.backendUrl}/tasks/${id}`, task)
      .pipe(map(t => Task.from(t)))
  }

  trigger(task_id: string) {
    return this.http.post<TaskBuildResponse>(`${environment.backendUrl}/tasks/${task_id}/trigger`, null)
  }

  delete(task: Task) {
    return this.http.delete<TaskDeleteResponse>(`${environment.backendUrl}/tasks/${task.id}`)
  }
}
