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
}
