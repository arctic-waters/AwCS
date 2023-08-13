import 'dotenv/config';

import express from 'express';
import path from 'path';
import { logHttp } from './middleware/morgan.js';
import { configure as configureAdmin } from './routes/admin.js';
import { configure as configureGraphQL } from './routes/api.js';
import { log } from './services/log.js';
import { prisma } from './services/prisma.js';
import { __dirname } from './util/path.js';

const { PORT = 3000 } = process.env;

const ROUTES = [
  { prefix: '/api', configure: configureGraphQL },
  { prefix: '/admin', configure: configureAdmin },
];

async function bootstrap() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(logHttp);

  app.use('/images', express.static(path.join(__dirname(import.meta), '..', 'assets', 'images')));

  await Promise.all(
    ROUTES.map(async ({ prefix, configure }) => {
      const router = express.Router();
      await configure(router);

      app.use(prefix, router);
      log.info(`Configured routes: ${prefix}`);
    }),
  );

  app.listen(PORT, () => {
    log.info(`Listening on :${PORT}`);
  });
}

bootstrap()
  .catch(async (e) => {
    log.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
