// logger.ts
import { Chalk } from "chalk";

const chalk  = new Chalk({ level: 3 });

export class Logger {
  constructor(private context?: string) {}

  private timestamp() {
    return chalk.gray(new Date().toISOString());
  }

  private ctx() {
    return this.context ? chalk.cyan(`[${this.context}]`) : "";
  }

  log(message: any, ...meta: any[]) {
    console.log(
      this.timestamp(),
      chalk.green("LOG"),
      this.ctx(),
      chalk.green(message),
      ...meta
    );
  }

  debug(message: any, ...meta: any[]) {
    console.log(
      this.timestamp(),
      chalk.magenta("DEBUG"),
      this.ctx(),
      chalk.magentaBright(message),
      ...meta
    );
  }

  warn(message: any, ...meta: any[]) {
    console.warn(
      this.timestamp(),
      chalk.yellow("WARN"),
      this.ctx(),
      chalk.yellow(message),
      ...meta
    );
  }

  error(message: any, trace?: any, ...meta: any[]) {
    console.error(
      this.timestamp(),
      chalk.red("ERROR"),
      this.ctx(),
      chalk.red(message),
      trace ?? "",
      ...meta
    );
  }
}

export const appLogger = new Logger("APP");
