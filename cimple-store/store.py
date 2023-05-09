import json
import os


class Repo:
    def __init__(self, file: str):
        self.filename = file
        if os.path.exists(file):
            self.init_from_file(file)
        else:
            self.index = 0
            self.repo = {}

    def init_from_file(self, file):
        with open(file, "r") as f:
            self.repo = json.load(f)
            self.index = max([int(k) for k in self.repo.keys()])

    def list(self):
        return self.repo

    def save(self):
        with open(self.filename, "w") as f:
            f.write(json.dumps(self.repo))

    def __iadd__(self, value):
        self.index += 1
        value['id'] = self.index
        self[str(self.index)] = value
        return self

    def __setitem__(self, key, value):
        self.repo[str(key)] = value
        self.save()

    def __getitem__(self, key):
        return self.repo[str(key)]

    def __contains__(self, key):
        return str(key) in self.repo

    def __delitem__(self, key):
        del self.repo[str(key)]
        self.save()
