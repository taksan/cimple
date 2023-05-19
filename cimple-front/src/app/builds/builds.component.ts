import {Component, OnInit} from '@angular/core';
import {Build} from "../model/build";
import {TaskService} from "../task.service";
import {ActivatedRoute} from "@angular/router";
import {Task} from "../model/task";
import {ToasterService} from "../toaster/toaster.service";
import {BuildNotifierService} from "../build-notifier.service";
import {WebSocketService} from "../web-socket.service";
import {DateUtils} from "../utils/date-utils";

@Component({
  selector: 'app-builds',
  templateUrl: './builds.component.html',
  styleUrls: ['./builds.component.scss']
})
export class BuildsComponent implements OnInit {
  currentTask: Task | null | undefined = null
  public selectedBuild: Build | null | undefined = null

  constructor(private taskService: TaskService,
              private route: ActivatedRoute,
              private toaster: ToasterService,
              private webSocketService: WebSocketService,
              private buildNotifier: BuildNotifierService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (!params['id'])
        return
      this.taskService.get(params['id']).subscribe({
        next: task => {
          this.currentTask = task
        },
        error: (err) => {
          this.toaster.error("Failed to load task builds", err.message)
        }
      })
    })
    this.webSocketService.subscribe(message => {
      if (message.details?.task_id != this.currentTask?.id) return
      this.buildNotifier.notifyBuildCompleted(message)
      let newBuild = new Build(message.details);
      newBuild.isNew = true
      this.currentTask?.builds?.push(newBuild)
      setTimeout(()=> {
        newBuild.isNew =false
      }, 1000)
    })
  }

  selectBuild(build: Build) {
    this.selectedBuild = build
  }

  classFor(build: Build) {
    let additionalClass = "table-light"
    switch (build.execStatus()) {
      case "failed":
        additionalClass = "table-danger"
        break
      case "running":
        additionalClass = "table-info"
        break
      case "succeeded":
        additionalClass = "table-success";
        break
    }
    if (build === this.selectedBuild)
      additionalClass = "table-active"
    if (build.isNew)
      additionalClass = " flash"
    return `selectable ${additionalClass}`;
  }

  build() {
    let taskId = this.currentTask?.id
    if (taskId)
      this.taskService.trigger(taskId).subscribe()
  }

  duration(selectedBuild: Build | null | undefined) {
    if (!selectedBuild || selectedBuild.finished == null || selectedBuild.created == null) return
    return selectedBuild.finished?.getTime() - selectedBuild.created.getTime()
  }
}
