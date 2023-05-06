import os

import uvicorn

if __name__ == "__main__":
    if os.environ.get("STORE_DOMAIN") is None and os.environ.get("RUN_WITHOUT_DATABASE") is None:
        raise BaseException("STORE_DOMAIN is not set. If you want to run without database, set variable "
                            "RUN_WITHOUT_DATABASE")
    port = os.environ.get("PORT", "8001")
    uvicorn.run("app:app", host="0.0.0.0", port=int(port), reload=True, debug=True)

