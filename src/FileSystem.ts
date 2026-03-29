// console.log(import.meta.glob("/public/fs/**/*"));
//
//
//
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
}

export class File extends DirectoryNode {
  type = NodeType.File as const;
  load: () => Promise<{ default: string }>;

  constructor(name: string, loader: () => Promise<{ default: string }>) {
    super(name);
    this.load = loader;
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

      if (current === this.root) {
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
}
