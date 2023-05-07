import {Build} from "./build";

export class Task {
  id: string | null | undefined = null
  name: string = ""
  image: string| null | undefined= ""
  schedule: string| null | undefined = ""
  script: string = ""
  created: Date| null | undefined = null
  builds: Build[] | null | undefined  = [];

  constructor(name: string, image: string| null, schedule: string| null, script: string) {
    this.name = name
    this.image = image
    this.schedule = schedule
    this.script = script
  }
}
