import {Component, OnInit} from '@angular/core';
import {Build} from "../model/build";
import {TaskService} from "../task.service";
import {ActivatedRoute} from "@angular/router";
import {Task} from "../model/task";

@Component({
  selector: 'app-builds',
  templateUrl: './builds.component.html',
  styleUrls: ['./builds.component.scss']
})
export class BuildsComponent implements OnInit {
  currentTask: Task | null | undefined = null
  selectedBuildLogs: string = "<select a build to see the logs>"
  private selectedBuild: Build | null | undefined = null

  constructor(private taskService: TaskService, private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.taskService.get(params['id']).subscribe(task => {
          this.currentTask = task
        })
      }
    })
  }

  selectBuild(build: Build) {
    this.selectedBuildLogs = build.output || "<no output available>"
    this.selectedBuild = build
  }

  classFor(build: Build) {
    let additionalClass = "table-light"
    if (this.statusOf(build) === "failed")
      additionalClass = "table-danger"
    if (this.statusOf(build) === "running")
      additionalClass = "table-info"
    if (this.statusOf(build) === "succeeded")
          additionalClass = "table-success"
    if (build === this.selectedBuild)
      additionalClass = "table-active"
    return `selectable ${additionalClass}`;
  }

  statusOf(build: Build) {
    if (build.exit_code === null || build.exit_code === undefined)
      return "running";
    if (build.exit_code === 0)
      return "succeeded";
    return "failed";
  }
}
