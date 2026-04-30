import { Command } from "./Commands";
import { FileSystem } from "./interface/fs";
import { Output } from "./interface/output";

class Shell {
  out: Output;
  in: HTMLInputElement;
  fileSystem: FileSystem;
  commands: Record<string, Command> = {};
  runtime?: Promise<unknown>;
  session: string[] = [];
  sessionPtr: number = -1;

  constructor(output: Output, input: HTMLInputElement) {
    this.out = output;
    this.in = input;
    this.fileSystem = new FileSystem();
    this.commands = Command.getAllCommands();
  }

  handleCommand(prompt: string) {
    this.session.push(prompt);
    let command = prompt.split(" ")[0];
    if (command in this.commands) {
      return this.commands[command].execute(this, prompt);
    }

    let file = this.fileSystem.getProgram(command);

    if (file) {
      this.runtime = file.execute(this, prompt);
      this.runtime.then(() => console.log("Done"));
    } else {
      throw new Error(`Command not found "${command}"`);
    }
  }
}

export default Shell;
