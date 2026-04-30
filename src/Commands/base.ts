import type Shell from "../Shell";

export abstract class Command {
  private static registry: Record<string, Command> = {};
  abstract command: string;

  static register(instance: Command) {
    Command.registry[instance.command] = instance;
  }

  static getAllCommands(): Record<string, Command> {
    return Command.registry;
  }

  abstract help(): void;
  abstract execute(shell: Shell, extra: string): void;

  get_options(prompt: string): string[] {
    return prompt
      .split(" ")
      .filter((n) => n.startsWith("-") && !n.startsWith("--"))
      .flatMap((c) => Array.from(c.slice(1, c.length)));
  }
}
