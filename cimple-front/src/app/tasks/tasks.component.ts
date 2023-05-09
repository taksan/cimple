import {Component, OnInit} from '@angular/core';
import {Task} from "../model/task";
import {TaskService} from "../task.service";
import {TaskBuildResponse} from "../model/task-build-response";
import {TaskDeleteResponse} from "../model/task-delete-response";
import {ToasterService} from "../toaster/toaster.service";

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  taskList: Task[] = [];

  constructor(private taskService: TaskService,
              private toaster: ToasterService) {
  }

  ngOnInit(): void {
    this.updateTasks();
  }

  private updateTasks() {
    this.taskService.list().subscribe({
      next: (tasks: Map<string, Task>) => {
        this.taskList = Object.values(tasks)
      },
      error: (err) => {
        console.log(err)
        this.toaster.error("Failed fetch tasks", err.message)
      }
    })
  }

  triggerTask(task_id: string | null |  undefined): void {
    if (!task_id) return;
    this.taskService.trigger(task_id).subscribe({
      next: (response: TaskBuildResponse) => {
        this.toaster.success(
          'Task triggered',
          `Build #${response.buildNumber} for task '${response.task}' started`) }
      ,
      error: (err) => {
        this.toaster.error('Task trigger failed', err.message)
      }
    })
  }

  deleteTask(task: Task) {
    this.taskService.delete(task).subscribe({
      next: (response: TaskDeleteResponse) => {
        this.updateTasks()
        this.toaster.success(
          'Task removed',
          `Task #${response.taskId} completed`) }
      ,
      error: (err) => {
        this.toaster?.error('Task removal failed', err.message)
      }
    })
  }
}
