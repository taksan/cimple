import os

import uvicorn

if __name__ == "__main__":
    if os.environ.get("STORE_DOMAIN") is None and os.environ.get("RUN_WITHOUT_DATABASE") is None:
        raise BaseException("STORE_DOMAIN is not set. If you want to run without database, set variable "
                            "RUN_WITHOUT_DATABASE")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
