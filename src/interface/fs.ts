enum NodeType {
  Dir,
  File,
}

abstract class DirectoryNode {
  abstract type: NodeType;
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  isDir(): this is Directory {
    return this.type === NodeType.Dir;
  }

  isFile(): this is File {
    return this.type === NodeType.File;
  }

  abstract getPath(path: string[]): DirectoryNode;
}

export class File extends DirectoryNode {
  type = NodeType.File as const;
  load: () => Promise<{ default: string }>;

  constructor(name: string, loader: () => Promise<{ default: string }>) {
    super(name);
    this.load = loader;
  }

  getPath(path: string[]): File {
    if (path.length > 0) {
      throw new Error(`${this.name} is not a valid directory`);
    }

    return this;
  }
}

class Directory extends DirectoryNode {
  type = NodeType.Dir as const;
  parent: Directory;
  childs: (File | Directory)[];

  constructor(name: string, parent?: Directory, nodes?: (File | Directory)[]) {
    super(name);
    this.childs = [];

    if (parent) {
      this.parent = parent;
    } else {
      this.parent = this;
    }

    if (nodes) {
      this.childs = nodes;
    }
  }

  addChild(path: string[], node: Directory | File) {
    // no path remaining so we have found the parent
    if (path.length === 0) {
      this.childs.push(node);
      return;
    } else {
      let dirName = path[0];
      let dir = this.getDir(dirName);
      if (!dir) {
        dir = new Directory(dirName, this);
        this.childs.push(dir);
      }
      dir.addChild(path.slice(1), node);
    }
  }

  private getDir(name: string): Directory | undefined {
    let matches = this.childs.filter(
      (c): c is Directory => c.isDir() && c.name === name,
    );
    if (matches.length === 1) {
      return matches[0];
    }
  }

  private getChild(name: string): Directory | File | undefined {
    for (let c of this.childs) {
      if (c.name === name) {
        return c;
      }
    }
  }

  public getPath(path: string[]): Directory | File {
    console.log("getPath: " + path.toString());
    if (path.length === 0) {
      return this;
    }

    let [head, ...tail] = path;

    if (head == ".") {
      return this.getPath(tail);
    }

    if (head == "..") {
      return this.parent.getPath(tail);
    }

    let child = this.getChild(head);
    if (!child) {
      throw new Error("Unknown Path");
    }
    return child.getPath(tail);
  }
}

export class FileSystem {
  root: Directory;
  currentDir: Directory;

  constructor() {
    this.root = new Directory("root");
    this.currentDir = this.root;

    let files = import.meta.glob<{ default: string }>("/public/fs/**/*", {
      query: "?raw",
    });
    Object.entries(files).forEach(([k, v]) => {
      let path: string[] = k.replace("/public/fs/", "").split("/");
      let fileName = path.at(-1) || "unknow file";
      let file = new File(fileName, v);
      path = path.slice(0, -1);
      this.root.addChild(path, file);
    });
  }

  getCurrentPath(): string[] {
    let path: string[] = [];
    let current = this.currentDir;

    while (true) {
      path.push(current.name);
      current = current.parent;

      if (current.name == this.root.name) {
        return path.reverse();
      }
    }
  }

  pwd(): string {
    return "/" + this.getCurrentPath().join("/");
  }

  ls(l: boolean, a: boolean): string[] {
    let files = this.currentDir.childs.filter(
      (c) => !c.name.startsWith(".") || a,
    );
    if (l) {
      return files.map((c) => c.name);
    } else {
      return [files.map((c) => c.name).join("\t")];
    }
  }

  cd(path: string[]) {
    console.log("cd " + path);
    let start = this.currentDir;
    if (path[0] === "") {
      start = this.root;
      path = path.slice(1);
    }
    let filesysNode = start.getPath(path);
    if (filesysNode.isFile()) {
      throw new Error(`${path} is not a valid directory`);
    }

    this.currentDir = filesysNode;
    console.log(this.currentDir.name);
  }
}
