/**
 * Simple logger for floimg
 */
export class Logger {
  constructor(private verbose: boolean = false) {}

  info(message: string, ...args: unknown[]): void {
    if (this.verbose) {
      console.log(`[floimg] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[floimg] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`[floimg] ${message}`, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.verbose) {
      console.debug(`[floimg] ${message}`, ...args);
    }
  }
}
