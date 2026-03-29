import { Command } from "./base";

export class PWD extends Command {
  command = "pwd";

  help() {}

  execute(extra: string): void {
    if (this.isTerminalConnected()) {
      let currentPath = this.terminal.fileSystem.getCurrentPath();
      this.terminal.println(currentPath.join("/"));
    }
  }
}
export class LS extends Command {
  command = "ls";

  help() {}

  execute(extra: string): void {
    if (this.isTerminalConnected()) {
      let files = this.terminal.fileSystem.currentDir.childs.filter(
        (c) => !c.name.startsWith("."),
      );
      let fileNames = files.map((c) => c.name);
      this.terminal.println(fileNames.join("  "));
    }
  }
}

Command.register(new LS());
Command.register(new PWD());
