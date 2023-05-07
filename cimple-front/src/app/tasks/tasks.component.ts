import {Component, OnInit, ViewChild} from '@angular/core';
import {Task} from "../model/task";
import {TaskService} from "../task.service";
import {ToasterComponent} from "../toaster/toaster.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  @ViewChild('toaster') toaster: ToasterComponent | undefined;
  taskList: Task[] = [];

  constructor(private taskService: TaskService) {
  }

  ngOnInit(): void {
    this.taskService.list().subscribe((tasks: Map<string, Task>)=> {
        this.taskList = Object.values(tasks)
    })
  }

  triggerTask(task_id: string | null |  undefined): void {
    if (!task_id) return;
    this.taskService.trigger(task_id).subscribe({
      next: () => { this.toaster?.showToast('Task triggered', `Task ${task_id} started`) },
      error: (err) => { this.toaster?.showToast('Task trigger failed', err.message) }
    })
  }
}
