import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TaskService} from "../task.service";
import {Task} from "../model/task";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-task-create',
  templateUrl: './task-editor.component.html',
  styleUrls: ['./task-editor.component.scss']
})
export class TaskEditorComponent implements OnInit {
  taskForm = new FormGroup({
    name: new FormControl('', Validators.required),
    image: new FormControl(''),
    schedule: new FormControl(''),
    script: new FormControl('', Validators.required),
    memory: new FormControl(''),
  })
  title = "Task Creation"
  currentTaskId: number | null = null
  constructor(private taskService: TaskService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.currentTaskId = params['id']
        this.title = "Task Update"
        this.taskService.get(params['id']).subscribe(r => {
          this.taskForm.patchValue(r)
        })
      }
    })
  }
  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched()
      return
    }
    let task: Task = new Task(
      this.taskForm.get('name')?.value || '',
      this.taskForm.get('image')?.value || '',
      this.taskForm.get('schedule')?.value || '',
      this.taskForm.get('script')?.value || ''
    )
    if (this.currentTaskId) {
      this.taskService.update(this.currentTaskId, task).subscribe( {
        next: _r => this.router.navigate(['/']).then(),
        error: e => {
          console.error(e)
        }
      })
    }
    else {
      this.taskService.create(task).subscribe( {
        next: _r => this.router.navigate(['/']).then(),
        error: e => {
          console.error(e)
        }
      })
    }
  }

  classFor(field: string) {
    if (this.taskForm.get(field)?.invalid && this.taskForm.get(field)?.touched)
      return "form-control is-invalid"
    return "form-control"
  }
}
