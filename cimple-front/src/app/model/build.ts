export class Build {
  task_id: number | null | undefined;
  id: number | null | undefined;
  output: string | null | undefined
  status: string = 'started'
  exit_code: number | null | undefined
  created: Date | null | undefined
  finished: Date | null | undefined
  started_by: string = ''
  isNew: boolean = false

  public constructor(init?: Partial<Build>) {
    this.task_id = init?.task_id;
    this.id = init?.id;
    this.output = init?.output;
    this.status = init?.status || "started";
    this.exit_code = init?.exit_code;
    this.created = init?.created;
    this.finished = init?.finished;
    this.started_by = init?.started_by || "";
  }

  public execStatus(): "running" | "succeeded" | "failed" {
    if (this.exit_code === null || this.exit_code === undefined)
      return "running";
    if (this.exit_code === 0)
      return "succeeded";
    return "failed";
  }
}
