export class Build {
  task_id: number | null | undefined;
  id: number | null | undefined;
  output: string | null | undefined
  status: string = 'started'
  exit_code: number | null | undefined
  created: Date | null | undefined
  finished: Date | null | undefined
}
