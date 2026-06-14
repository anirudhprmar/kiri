import chalk from "chalk";
import boxen from "boxen";
import ora from "ora";

export interface Command {
  name: string;
  description: string;
  usage: string;
  handler: (args: string[], ctx: Record<string, unknown>) => void | Promise<void>;
}

export class CommandParser {
  private commands = new Map<string, Command>();

  register(command: Command): void {
    this.commands.set(command.name, command);
  }

  registerAll(commands: Command[]): void {
    for (const cmd of commands) {
      this.register(cmd);
    }
  }

  parse(input: string, ctx: Record<string, unknown>): boolean {
    if (!input.startsWith("/")) return false;

    const parts = input.slice(1).trim().split(/\s+/);
    const name = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    if (!name) return true;

    const command = this.commands.get(name);
    if (!command) {
      console.log(`${chalk.red(`Unknown command: /${name}`)}. ${chalk.dim("Type /help for available commands.")}`);
      return true;
    }

    const result = command.handler(args, ctx);
    if (result instanceof Promise) {
      result.catch((err) => console.error(chalk.red(`[CMD] Error executing /${name}:`), err));
    }
    return true;
  }

  getHelp(): string {
    const lines: string[] = [];
    for (const cmd of this.commands.values()) {
      lines.push(`  ${chalk.cyan(cmd.usage)}  ${chalk.dim(cmd.description)}`);
    }
    return boxen(lines.join("\n"), {
      padding: 1,
      margin: 1,
      title: chalk.bold("Available Commands"),
      borderStyle: "round",
      borderColor: "cyan",
    });
  }
}

export const logger = {
  info: (msg: string) => console.log(chalk.cyan(msg)),
  success: (msg: string) => console.log(chalk.green(msg)),
  warn: (msg: string) => console.log(chalk.yellow(msg)),
  error: (msg: string) => console.log(chalk.red(msg)),
  dim: (msg: string) => console.log(chalk.dim(msg)),
  message: (username: string, msg: string, isYou: boolean) =>
    console.log(isYou ? chalk.green(`[You]: ${msg}`) : chalk.blue(`[${username}]: ${msg}`)),
  divider: () => console.log(chalk.dim("─".repeat(40))),
};

export function makeBox(title: string, content: string): string {
  return boxen(content, {
    padding: 1,
    margin: 1,
    title: chalk.bold(title),
    borderStyle: "round",
    borderColor: "cyan",
  });
}

export function spinner(text: string) {
  return ora({ text, color: "cyan" });
}
