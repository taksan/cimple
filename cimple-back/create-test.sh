curl -H "content-type: application/json" http://localhost:8000/tasks --data '{"name": "a task", "script": "ls -l"}'
curl -X POST http://localhost:8000/tasks/1/trigger
