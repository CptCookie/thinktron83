import { ThinkTron } from "../terminal";

export abstract class Command {
  private static registry: Record<string, Command> = {};
  abstract command: string;
  terminal?: ThinkTron;

  static register(instance: Command) {
    Command.registry[instance.command] = instance;
  }

  static getAllCommands(): Record<string, Command> {
    return Command.registry;
  }

  connectTerminal(terminal: ThinkTron) {
    this.terminal = terminal;
  }

  abstract help(): void;
  abstract execute(extra: string): void;

  isTerminalConnected(): this is this & { terminal: ThinkTron } {
    return this.terminal != undefined;
  }
}
