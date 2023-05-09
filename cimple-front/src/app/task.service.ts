import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Task} from "./model/task";
import {Observable} from "rxjs";
import {TaskBuildResponse} from "./model/task-build-response";
import {TaskDeleteResponse} from "./model/task-delete-response";


@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient) { }

  public list(): Observable<Map<string, Task>> {
    return this.http.get<Map<string, Task>>("http://localhost:8000/tasks")
  }

  public create(task: Task): Observable<Task> {
    return this.http.post<Task>("http://localhost:8000/tasks", task)
  }

  public get(id: number) {
    return this.http.get<Task>(`http://localhost:8000/tasks/${id}`)
  }

  public update(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`http://localhost:8000/tasks/${id}`, task)
  }

  trigger(task_id: string) {
    return this.http.post<TaskBuildResponse>(`http://localhost:8000/tasks/${task_id}/trigger`, null)
  }

  delete(task: Task) {
    return this.http.delete<TaskDeleteResponse>(`http://localhost:8000/tasks/${task.id}`)
  }
}
