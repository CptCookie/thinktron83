import Shell from "../Shell";
import { Command } from "./base";

export class Pwd extends Command {
  command = "pwd";

  help() {}

  execute(shell: Shell, _args: string) {
    let currentPath = shell.fileSystem.getCurrentPath();
    shell.out.printLine(currentPath.join("/"));
  }
}

export class Ls extends Command {
  command = "ls";

  help() {}

  execute(shell: Shell, _args: string) {
    console.log(this.get_options(_args));
    let files = shell.fileSystem.currentDir.childs.filter(
      (c) => !c.name.startsWith("."),
    );
    let fileNames = files.map((c) => c.name);
    shell.out.printLine(fileNames.join("\t"));
  }
}

export class Clear extends Command {
  command = "clear";

  help() {}

  execute(shell: Shell, _args: string) {
    return shell.out.clear;
  }
}

export class Cd extends Command {
  command = "cd";

  help() {}

  execute(shell: Shell, _args: string) {
    let [_command, pathString, ..._] = _args.split(" ");
    let path = pathString.split("/");
    shell.fileSystem.cd(path);
  }
}

for (let c of [Ls, Pwd, Clear, Cd]) {
  Command.register(new c());
}
