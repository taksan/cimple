import os
import uvicorn


def main():
    port = os.environ.get("PORT", "8001")
    uvicorn.run("cimple_store.app:app", host="0.0.0.0", port=int(port), reload=True)


if __name__ == "__main__":
    main()
