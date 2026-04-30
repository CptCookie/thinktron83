import type Shell from "../Shell";

enum NodeType {
  Dir,
  File,
  Program,
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

  isProgram(): this is Program {
    return this.type === NodeType.Program;
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

export class Program extends DirectoryNode {
  type = NodeType.Program as const;
  load: () => Promise<{ default: string }>;

  constructor(name: string, loader: () => Promise<{ default: string }>) {
    super(name);
    this.load = loader;
  }

  getPath(path: string[]): Program {
    if (path.length > 0) {
      throw new Error(`${this.name} is not a valid directory`);
    }

    return this;
  }

  async execute(shell: Shell, prompt: string): Promise<void> {
    let result: any = await this.load();
    try {
      await result.default();
    } catch (e) {
      console.error(e);
    }

    return result.run();
  }
}

class Directory extends DirectoryNode {
  type = NodeType.Dir as const;
  parent: Directory;
  childs: (File | Directory | Program)[];

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

  addChild(path: string[], node: Directory | File | Program) {
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

  private getChild(name: string): Directory | File | Program | undefined {
    for (let c of this.childs) {
      if (c.name === name) {
        return c;
      }
    }
  }

  public getPath(path: string[]): Directory | File | Program {
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

    let programs = import.meta.glob("/public/fs/bin/**/*.js");
    Object.entries(programs).forEach(([k, v]) => {
      let path: string[] = k.replace("/public/fs/", "").split("/");
      let fileName = path.at(-1) || "unknow file";
      let file = new Program(fileName, v as any);
      path = path.slice(0, -1);
      this.root.addChild(path, file);
    });

    let files = import.meta.glob<{ default: string }>(
      ["/public/fs/**/*", "!**/bin/**"],
      {
        query: "?raw",
      },
    );
    Object.entries(files).forEach(([k, v]) => {
      let path: string[] = k.replace("/public/fs/", "").split("/");
      let fileName = path.at(-1) || "unknow file";
      let file = new File(fileName, v);
      path = path.slice(0, -1);
      this.root.addChild(path, file);
    });
  }

  getFile(name: string): File | undefined {
    return this.currentDir.childs
      .filter((c): c is File => c.isFile()) // thx TS [TS issue #29317] :(
      .find((c) => c.name === name);
  }

  getProgram(name: string): Program | undefined {
    return this.currentDir.childs
      .filter((c): c is Program => c.isProgram()) // thx TS [TS issue #29317] :(
      .find((c) => c.name === name);
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
    let start = this.currentDir;
    if (path[0] === "") {
      start = this.root;
      path = path.slice(1);
    }
    let filesysNode = start.getPath(path);
    if (filesysNode.isFile() || filesysNode.isProgram()) {
      throw new Error(`${path} is not a valid directory`);
    }

    this.currentDir = filesysNode;
  }
}
