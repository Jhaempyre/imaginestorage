import { ConsoleLogger, Injectable } from "@nestjs/common";
import { Global, Module } from "@nestjs/common";

@Injectable()
export class AppLogger extends ConsoleLogger {
  log(message: string, context?: string) {
    super.log(`[APP] ${message}`, context);
  }

  error(message: string, trace?: string, context?: string) {
    super.error(`[APP] ${message}`, trace, context);
  }

  warn(message: string, trace?: string, context?: string) {
    super.warn(`[APP] ${message}`, trace, context);
  }

  debug(message: string, context?: string) {
    super.debug(`[APP] ${message}`, context);
  }
}

@Global()
@Module({
  providers: [AppLogger],
  exports: [AppLogger], // must export for DI
})
export class LoggerModule {}
