RED='\033[1;31m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
RESET='\033[0m'
if [[ -z "$BACKEND_URL" ]]; then
    echo -e "${YELLOW}Warning: BACKEND_URL is not set${RESET}"
else
    echo -e "${CYAN}Info: BACKEND_URL is $BACKEND_URL${RESET}"
fi
sed "s|{{ BACKEND_URL }}|$BACKEND_URL|g" -i  /usr/share/nginx/html/main*.js
    
