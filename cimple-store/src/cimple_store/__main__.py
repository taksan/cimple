import logging
import os
import uvicorn

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[logging.StreamHandler()]
)


def main():
    db_file = os.environ.get("DB_FILE", "data/tasks.json")
    os.makedirs(os.path.dirname(db_file), exist_ok=True)
    port = os.environ.get("PORT", "8001")
    uvicorn.run("cimple_store.cimple_store:app", host="0.0.0.0", port=int(port), reload=True)


if __name__ == "__main__":
    main()
