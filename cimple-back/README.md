# CImple Backend

This is the core engine of CImple, capable of running your tasks.

Here's the api definition:

- GET /tasks : returns the task list
- POST /tasks: create a task. Returns the created task
- GET /tasks/{id}: gets the details of given task id
- PUT /tasks/{id}: updates a task definition
- DELETE /tasks/{id}: deletes a task
- GET /tasks/{id}/script: gets the script definition of a task
- GET /tasks/{task_id}/image : gets the image name of task
- POST /tasks/{task_id}/trigger : triggers a task execution
- POST /tasks/{task_id}/builds/{build_id} : notifies that a given build of a task completed
