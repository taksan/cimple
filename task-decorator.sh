#!/bin/bash

# reserved for errors and elapsed time
RED='\033[0;31m'
YELLOW='\033[1;33m'

# other colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
LIGHT_GREEN='\033[1;32m'
LIGHT_PURPLE='\033[1;35m'
ORANGE='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
GRAY='\033[0;37m'
LIGHT_BLUE='\033[1;34m'
LIGHT_CYAN='\033[1;36m'
DARK_GRAY='\033[1;30m'

NC='\033[0m'

COLOR=( "$GREEN"
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

function handle_task_error()
{
    local task_name=$1
    echo "
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
ERROR:   Task [$task_name] FAILED $(date)
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    " >&2
}

function task_completed()
{
    local end
    local elapsed
    end=$(date +%s)
    # shellcheck disable=SC2016
    elapsed=$((end-'$start')); echo -e "'$YELLOW'" took $elapsed seconds"'$NC'"
}

function task() {
  local start
  local task_name="$1"
  local enable_ts="${2:-}"
  local ts
  local task_num

  task_num=$(cat .task-num)
  task_num=$(((task_num+1)%COLOR_LEN))
  echo $task_num > .task-num
  local color=${COLOR[task_num]}

  start=$(date +%s)

  if [[ "$enable_ts" = "with_timestamp" ]]; then
    # shellcheck disable=SC2089
    ts='strftime("[%Y-%m-%dT%H:%M:%S]")'
  else
    ts=''
  fi


  echo -e "${color}[$task_name] *********************************************************************************$NC"
  echo -e "${color}[$task_name]       Starting task [$task_name] at $(date)$NC"
  echo -e "${color}[$task_name] *********************************************************************************$NC"
  exec > >(trap "" INT TERM; awk '{ print "'"$color"'"'$ts'"['"$task_name"']'"$NC"'"$0; fflush(stdout) }')
  exec 2> >(trap "" INT TERM;awk '{ print "'"$color"'"'$ts'"['"$task_name"']'"$RED"'"$0"'"$NC"'"; fflush(stdout) }' >&2)
  trap 'end=$(date +%s); elapsed=$((end-'"$start"')); echo -e "'"$YELLOW"'" took $elapsed seconds"'"$NC"'"' EXIT
  # shellcheck disable=SC2064
  trap "handle_task_error '$task_name'" ERR
}
