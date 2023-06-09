import {Component, OnInit} from '@angular/core';
import {Task} from "../model/task";
import {TaskService} from "../task.service";
import {TaskBuildResponse} from "../model/task-build-response";
import {TaskDeleteResponse} from "../model/task-delete-response";
import {ToasterService} from "../toaster/toaster.service";
import {Router} from "@angular/router";
import {WebSocketService} from "../web-socket.service";
import {BuildNotifierService} from "../build-notifier.service";
import {Build} from "../model/build";

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  taskList: Task[] = [];

  constructor(private taskService: TaskService,
              private toaster: ToasterService,
              private router: Router,
              private webSocketService: WebSocketService,
              private buildNotifier: BuildNotifierService) {
  }

  ngOnInit(): void {
    this.updateTasks();
    this.webSocketService.subscribe(message => {
      this.buildNotifier.notifyBuildCompleted(message)
      let updatedList = this.taskList.slice()
      updatedList.find(task => task.id == message.details?.task_id)?.builds?.push(new Build(message.details))
      this.taskList = updatedList
    })
  }

  public updateTasks() {
    this.taskService.list().subscribe({
      next: (tasks: Task[]) => {
        this.taskList = tasks
      },
      error: (err) => {
        this.toaster.error("Failed fetch tasks", err.message)
      }
    })
  }

  triggerTask(task_id: string | null |  undefined): void {
    if (!task_id) return;
    this.taskService.trigger(task_id).subscribe({
      next: (response: TaskBuildResponse) => {
        this.toaster.success(
          'Task started',
          `Build #${response.buildNumber} for task '${response.task}' started`) }
      ,
      error: (err) => {
        this.toaster.error('Task start failed', err.message)
      }
    })
  }

  deleteTask(task: Task) {
    if (!confirm(`This will remove task ${task.name}. Are you sure?`))
      return

    this.taskService.delete(task).subscribe({
      next: (_response: TaskDeleteResponse) => {
        this.updateTasks()
        this.toaster.success(
          'Task removed',
          `Task '${task.name}' removal completed`) }
      ,
      error: (err) => {
        this.toaster?.error('Task removal failed', err.message)
      }
    })
  }

  public taskClass(task: Task): string {
    switch (task.status()) {
      case 'running': return 'table-info'
      case 'succeeded': return 'table-success'
      case 'failed': return 'table-danger'
    }
    return "table-light"
  }

  async showBuilds(task: Task) {
    return this.router.navigate(["builds", task.id])
  }

  async editTask(task: Task) {
    return this.router.navigate(["update-task", task.id])
  }
}
