#!/bin/bash

# Reserved for errors and elapsed time
RED=$(tput setaf 1)
YELLOW=$(tput setaf 3)

# Other colors
GREEN=$(tput setaf 2)
CYAN=$(tput setaf 6)
LIGHT_GREEN=$(tput setaf 10)
LIGHT_PURPLE=$(tput setaf 5)
ORANGE=$(tput setaf 3)
BLUE=$(tput setaf 4)
PURPLE=$(tput setaf 5)
GRAY=$(tput setaf 7)
LIGHT_BLUE=$(tput setaf 12)
LIGHT_CYAN=$(tput setaf 14)
DARK_GRAY=$(tput setaf 8)

NC=$(tput sgr0)

COLOR=(
  "$GREEN"
  "$LIGHT_GREEN"
  "$LIGHT_PURPLE"
  "$CYAN"
  "$BLUE"
  "$PURPLE"
  "$GRAY"
  "$LIGHT_BLUE"
  "$ORANGE"
  "$LIGHT_CYAN"
  "$DARK_GRAY"
)
COLOR_LEN=${#COLOR[@]}

trap "rm -f .task-num" EXIT
echo 0 > .task-num

# prints a big error message if a task fails
function handle_task_error()
{
    local task_name=$1
    echo "
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
ERROR:   Task [$task_name] FAILED $(date)
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    " >&2
}

# prints elapsed time for a task
function task_completed()
{
    local end
    local elapsed
    end=$(date +%s)
    # shellcheck disable=SC2016
    elapsed=$((end-'$start')); echo -e "'$YELLOW'" took $elapsed seconds"'$NC'"
}

# decorates the output with a task name and color
function task() {
  local start
  local task_name="$1"
  local enable_ts="${2:-}"
  local ts
  local task_num

  # computes the task number and get a color
  exec 200> .task-num
  flock 200
  task_num=$(cat .task-num)
  task_num=$(((task_num+1)%COLOR_LEN))
  echo $task_num > .task-num
  flock -u 200
  local color=${COLOR[task_num]}

  start=$(date +%s)

  if [[ "$enable_ts" = "with_timestamp" ]]; then
    # if with_timestamp is enabled, print the date for each output line
    # shellcheck disable=SC2089
    ts='strftime("[%Y-%m-%dT%H:%M:%S]")'
  else
    ts=''
  fi

  echo -e "${color}[$task_name] *********************************************************************************$NC"
  echo -e "${color}[$task_name]       Starting task [$task_name] at $(date)$NC"
  echo -e "${color}[$task_name] *********************************************************************************$NC"

  # redirects stdout to add date, task name and colorize it
  exec > >(
    trap "" INT TERM;
    awk '{ print "'"$color"'"'"$ts"'"['"$task_name"']'"$NC"'"$0; fflush(stdout) }'
  )
  # redirects stderr to add date, task name and colorize it and make sure the error shows up in red
  exec 2> >(
    trap "" INT TERM;
    awk '{ print "'"$color"'"'"$ts"'"['"$task_name"']'"$RED"'"$0"'"$NC"'"; fflush(stdout) }' >&2
  )
  # when the script exits, print the elapsed time
  trap 'end=$(date +%s); elapsed=$((end-'"$start"')); echo -e "'"$YELLOW"'" took $elapsed seconds"'"$NC"'"' EXIT

  # if the script fails, handles the error
  # shellcheck disable=SC2064
  trap "handle_task_error '$task_name'" ERR
}
