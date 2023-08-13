import probe from 'probe-image-size';
import { prisma } from '../../services/prisma.js';
import { schema } from '../builder.js';

schema.prismaObject('ImageSource', {
  fields: (t) => ({
    url: t.exposeString('url', {
      description: 'The unique URL of the image source.',
    }),

    width: t.exposeInt('width', {
      description: 'The width of the image source.',
    }),

    height: t.exposeInt('height', {
      description: 'The height of the image source.',
    }),

    images: t.relation('images', {
      description: 'All the images that have this source.',
    }),
  }),
});

schema.mutationFields((t) => ({
  createImageSource: t.prismaField({
    type: 'ImageSource',
    description: 'Create a new image source with the given URL.',
    nullable: true,
    args: {
      url: t.arg.string({
        required: true,
        description: 'The URL of the image source.',
      }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const { width, height } = await probe(args.url).catch(() => ({}) as any);
      if (!width || !height) return null;

      return prisma.imageSource
        .upsert({
          where: { url: args.url },
          create: { url: args.url, width, height },
          update: {},
        })
        .catch(() => null);
    },
  }),

  deleteImageSource: t.field({
    type: 'Boolean',
    description: 'Delete an image source with the given URL.',
    args: {
      url: t.arg.string({
        required: true,
        description: 'The URL of the image source.',
      }),
    },
    resolve: async (root, args, ctx, info) =>
      prisma.imageSource
        .delete({ where: { url: args.url } })
        .then(() => true)
        .catch(() => false),
  }),
}));
