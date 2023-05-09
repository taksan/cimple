import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskEditorComponent } from './task-editor.component';

describe('TaskCreateComponent', () => {
  let component: TaskEditorComponent;
  let fixture: ComponentFixture<TaskEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaskEditorComponent]
    });
    fixture = TestBed.createComponent(TaskEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
