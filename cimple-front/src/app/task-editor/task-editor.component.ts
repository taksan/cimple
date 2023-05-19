import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TaskService} from "../task.service";
import {Task} from "../model/task";
import {ActivatedRoute, Router} from "@angular/router";
import {ToasterService} from "../toaster/toaster.service";

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
    memory: new FormControl('50'),
    cpu: new FormControl('0.1'),
  })
  title = "Task Creation"
  currentTaskId: string | null = null

  private originalTask: Task | null = null;

  constructor(private taskService: TaskService,
              private router: Router,
              private route: ActivatedRoute,
              private toaster: ToasterService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (!params['id'])
        return
      this.currentTaskId = params['id']
      this.title = "Task Update"
      this.taskService.get(params['id']).subscribe(task => {
        this.taskForm.patchValue(task)
        this.originalTask = task
      })
    })
  }
  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched()
      return
    }
    let task: Task = new Task(this.currentTaskId,
      this.taskForm.get('name')?.value || '',
      this.taskForm.get('image')?.value || '',
      this.taskForm.get('schedule')?.value || '',
      this.taskForm.get('script')?.value || '',
      this.taskForm.get('memory')?.value || '',
      this.taskForm.get('cpu')?.value || '')
    if (this.currentTaskId) {
      task.builds = this.originalTask?.builds
      this.taskService.update(this.currentTaskId, task).subscribe( {
        next: _r => this.router.navigate(['/']).then(),
        error: e => {
          this.toaster.error('Update failed', e.message)
        }
      })
      return;
    }

    this.taskService.create(task).subscribe( {
      next: _r => this.router.navigate(['/']).then(),
      error: e => {
        this.toaster.error('Creation failed', e.message)
      }
    })
  }

  classFor(field: string) {
    if (this.taskForm.get(field)?.invalid && this.taskForm.get(field)?.touched)
      return "form-control is-invalid"
    return "form-control"
  }
}
