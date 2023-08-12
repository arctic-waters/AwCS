import morgan from 'morgan';
import { log } from '../services/log.js';

export const logHttp = morgan('combined', {
  stream: {
    write(str: string) {
      log.http(str.replace(/\n$/, ''));
    },
  },
});
