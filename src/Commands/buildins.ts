import type ThinkTron from "../terminal";
import { Command } from "./base";

export class Pwd extends Command {
  command = "pwd";

  help() {}

  execute(terminal: ThinkTron, _: string): void {
    let currentPath = terminal.fileSystem.getCurrentPath();
    terminal.println(currentPath.join("/"));
  }
}

export class Ls extends Command {
  command = "ls";

  help() {}

  execute(terminal: ThinkTron, prompt: string): void {
    console.log(this.get_options(prompt));
    let files = terminal.fileSystem.currentDir.childs.filter(
      (c) => !c.name.startsWith("."),
    );
    let fileNames = files.map((c) => c.name);
    terminal.println(fileNames.join("\t"));
  }
}

export class Clear extends Command {
  command = "clear";

  help() {}

  execute(terminal: ThinkTron, _: string): void {
    terminal.output.replaceChildren();
  }
}

export class Cd extends Command {
  command = "cd";

  help() {}

  execute(terminal: ThinkTron, extra: string): void {
    let [_command, pathString, ..._] = extra.split(" ");
    let path = pathString.split("/");
    terminal.fileSystem.cd(path);
    console.log(terminal.fileSystem.currentDir);
  }
}

for (let c of [Ls, Pwd, Clear, Cd]) {
  Command.register(new c());
}
