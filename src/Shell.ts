import { Command } from "./Commands";
import { FileSystem } from "./interface/fs";
import { Output } from "./interface/output";

class Shell {
  out: Output;
  in: HTMLInputElement;
  fileSystem: FileSystem;
  commands: Record<string, Command> = {};
  runtime: any; //active programm for later execution of WASM
  session: string[] = [];
  sessionPtr: number = -1;

  constructor(output: Output, input: HTMLInputElement) {
    this.out = output;
    this.in = input;
    this.fileSystem = new FileSystem();
    this.commands = Command.getAllCommands();
  }

  handleCommand(prompt: string) {
    console.log(this.commands);
    this.session.push(prompt);

    let command = prompt.split(" ")[0];
    if (command in this.commands) {
      return this.commands[command].execute(this, prompt);
    } else {
      throw new Error(`Command not found "${command}"`);
    }
  }
}

export default Shell;
