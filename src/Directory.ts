import { File } from "./FileSystem";

export class Directory {
  name: string;
  parent: Directory;
  childs: (File | Directory)[];

  constructor(name: string, nodes?: (File | Directory)[], parent?: Directory) {
    this.name = name;
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

  private addChild(path: string[], node: Directory | File) {
    if (path.length === 0) {
      this.childs.push(node);
    }
  }

  private getDir(name: string) {
    let matches = this.childs.filter((c) => c.name === name);
    if (matches.length === 0) {
    }
  }
}
