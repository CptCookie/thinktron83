import { Command } from "./base";

export class PWD extends Command {
  command = "pwd";

  help() {}

  execute(_: string): void {
    if (this.isTerminalConnected()) {
      let currentPath = this.terminal.fileSystem.getCurrentPath();
      this.terminal.println(currentPath.join("/"));
    }
  }
}
export class LS extends Command {
  command = "ls";

  help() {}

  execute(_: string): void {
    if (this.isTerminalConnected()) {
      let files = this.terminal.fileSystem.currentDir.childs.filter(
        (c) => !c.name.startsWith("."),
      );
      let fileNames = files.map((c) => c.name);
      this.terminal.println(fileNames.join("\t"));
    }
  }
}

export class Clear extends Command {
  command = "clear";

  help() {}

  execute(_: string): void {
    if (this.isTerminalConnected()) {
      // TODO find a way to not cop
      let elements = Array.from(
        this.terminal.output.getElementsByTagName("pre"),
      );
      for (let e of elements) {
        e.remove();
      }
    }
  }
}

Command.register(new LS());
Command.register(new PWD());
Command.register(new Clear());
