import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TasksComponent} from "./tasks/tasks.component";
import {TaskEditorComponent} from "./task-editor/task-editor.component";
import {BuildsComponent} from "./builds/builds.component";
import {ToasterComponent} from "./toaster/toaster.component";

const routes: Routes = [
  {path: '', component: TasksComponent},
  {path: 'create-task', component: TaskEditorComponent},
  {path: 'update-task/:id', component: TaskEditorComponent},
  {path: 'builds/:id', component: BuildsComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
