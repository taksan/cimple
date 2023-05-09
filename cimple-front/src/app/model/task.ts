import {Build} from "./build";

export class Task {
  id: string | null | undefined = null
  name: string = ""
  image: string| null | undefined= ""
  schedule: string| null | undefined = ""
  script: string = ""
  created: Date| null | undefined = null
  builds: Build[] | null | undefined  = [];
  memory: string= ""
  cpu: string = ""

  constructor(name: string,
              image: string| null,
              schedule: string| null,
              script: string,
              memory: string = "10",
              cpu: string = "0.1") {
    this.name = name
    this.image = image
    this.schedule = schedule
    this.script = script
    this.memory = memory+"Mi"
    this.cpu = cpu
  }
}
