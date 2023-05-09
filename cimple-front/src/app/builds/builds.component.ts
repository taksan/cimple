import {Component, OnInit} from '@angular/core';
import {Build} from "../model/build";
import {TaskService} from "../task.service";
import {ActivatedRoute} from "@angular/router";
import {Task} from "../model/task";
import {ToasterService} from "../toaster/toaster.service";

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
              private toaster: ToasterService) {
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
    return `selectable ${additionalClass}`;
  }
}
