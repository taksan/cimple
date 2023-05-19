import os

import uvicorn


def main():
    if os.environ.get("STORE_URL") is None and os.environ.get("RUN_WITHOUT_DATABASE") is None:
        raise BaseException("STORE_URL is not set. If you want to run without database, set variable "
                            "RUN_WITHOUT_DATABASE")
    uvicorn.run("cimple_back.cimple_back:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
