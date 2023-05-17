export class Build {
  task_id: number | null | undefined;
  id: number | null | undefined;
  output: string | null | undefined
  status: string = 'started'
  exit_code: number | null | undefined
  created: Date | null | undefined
  finished: Date | null | undefined
  started_by: string = ''

  public execStatus(): "running" | "succeeded" | "failed" {
    if (this.exit_code === null || this.exit_code === undefined)
      return "running";
    if (this.exit_code === 0)
      return "succeeded";
    return "failed";
  }
}
