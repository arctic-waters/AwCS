import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSPrisma from '@adminjs/prisma';
import { Router } from 'express';
import { prisma } from '../services/prisma.js';
import { Prisma } from '@prisma/client';

AdminJS.registerAdapter({
  Resource: AdminJSPrisma.Resource,
  Database: AdminJSPrisma.Database,
});

const modelNavigation = {
  name: 'Model',
  icon: 'Model',
};

export function configure(router: Router) {
  const getModel = (name: string) =>
    Prisma.dmmf.datamodel.models.find((model) => model.name === name);

  const admin = new AdminJS({
    branding: {
      companyName: 'Admin Interface',
      withMadeWithLove: false,
    },
    rootPath: '/admin',
    resources: [
      {
        resource: { model: getModel('Tag'), client: prisma },
        options: {
          navigation: modelNavigation,
        },
      },
      {
        resource: { model: getModel('Image'), client: prisma },
        options: {
          navigation: modelNavigation,
        },
      },
      {
        resource: { model: getModel('ImageSource'), client: prisma },
        options: {
          navigation: modelNavigation,
        },
      },
    ],
  });

  const adminRouter = AdminJSExpress.buildRouter(admin);
  router.use('/', adminRouter);
}
