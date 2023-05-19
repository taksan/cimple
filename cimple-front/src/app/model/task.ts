import {Build} from "./build";

export class Task {
  id: string | null | undefined = null
  name: string = ""
  image: string| null | undefined= ""
  schedule: string| null | undefined = ""
  script: string = ""
  created: Date| null | undefined = null
  builds: Build[] | null | undefined  = [];
  memory: string= "10"
  cpu: string = "0.1"

  constructor(id: string | null | undefined = null,
              name: string = "",
              image: string | null = null,
              schedule: string | null = null,
              script: string = "",
              memory: string = "10",
              cpu: string = "0.1", created: Date | null = null) {
    this.id = id
    this.name = name
    this.image = image
    this.schedule = schedule
    this.script = script
    this.memory = memory
    this.cpu = cpu
    this.created = created
  }

  status(): "none" | "running" | "succeeded" | "failed" {
    if (!this.builds || this.builds.length == 0)
      return "none"
    return this.builds[this.builds.length-1].execStatus()
  }

  static from(t: Task) {
    let newInstance: Task = Object.assign(new Task(), t)
    newInstance.builds = newInstance.builds?.map(b => Object.assign(new Build(), b))
    return newInstance;
  }
}
