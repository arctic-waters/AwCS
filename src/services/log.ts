import chalk from 'chalk';
import { createLogger, format, transports } from 'winston';

const log = createLogger({
  level: 'http',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  log.add(
    new transports.Console({
      format: format.combine(
        format((info) => ({ ...info, level: info.level.toUpperCase() }))(),
        format.timestamp({ format: 'YYYY-MM-DDTHH:MM:ss.SSSZ' }),
        format.prettyPrint(),
        format.colorize(),
        format.printf((info) => {
          return `${chalk.gray(info.timestamp)} ${info.level} ${info.message}`;
        }),
      ),
    }),
  );
}

export { log };
