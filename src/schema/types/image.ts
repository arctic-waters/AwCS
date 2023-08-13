import { prisma } from '../../services/prisma.js';
import { schema } from '../builder.js';
import { Box, BoxInput } from './box.js';

schema.prismaObject('Image', {
  fields: (t) => ({
    id: t.exposeID('id', {
      description: 'The unique ID of the image.',
    }),

    index: t.exposeInt('index', {
      nullable: true,
      description: 'The unique index number of the image. Only root images have an index.',
    }),

    children: t.relation('children', {
      description: 'All the images that are direct children of this image.',
    }),

    parent: t.relation('parent', {
      description: 'The image that is the direct parent of this image.',
    }),

    dimensions: t.field({
      type: Box,
      description: 'The dimensions of the image.',
      resolve: async ({ x, y, width, height }) => new Box(x, y, width, height),
    }),

    tags: t.relation('tags', {
      description: 'All the tags that are associated with this image.',
    }),

    source: t.relation('source', {
      description: 'The source of the image.',
    }),
  }),
});

schema.queryFields((t) => ({
  images: t.prismaField({
    type: ['Image'],
    description: 'All the images in the database.',
    resolve: async (query, root, args, ctx, info) => prisma.image.findMany(),
  }),

  searchImages: t.prismaField({
    type: ['Image'],
    description: 'Search for images with any of the provided tags or parent image.',
    args: {
      parent: t.arg.id({
        required: false,
        description: 'The ID of the parent image.',
      }),

      tags: t.arg.stringList({
        required: false,
        description: 'The tags to search for.',
      }),
    },
    resolve: async (query, root, args, ctx, info) =>
      prisma.image.findMany({
        where: {
          tags: args.tags
            ? {
                some: {
                  name: {
                    in: args.tags,
                  },
                },
              }
            : undefined,
          parent: args.parent
            ? {
                id: typeof args.parent === 'number' ? args.parent : parseInt(args.parent),
              }
            : undefined,
        },
      }),
  }),

  queryImages: t.prismaField({
    type: ['Image'],
    description: 'Search for images with the given query.',
    args: {
      query: t.arg.string({
        required: true,
        description: 'The query to search for.',
      }),
    },
    resolve: async (query, root, args, ctx, info) => [],
  }),
}));

export const ImageCreateInput = schema.inputType('ImageCreateInput', {
  fields: (t) => ({
    index: t.int({ required: false }),
    parent: t.id({ required: false }),
    box: t.field({ type: BoxInput, required: true }),
    sourceUrl: t.string({ required: true }),
    tags: t.stringList({ required: false }),
  }),
});

export const ImageUpdateInput = schema.inputType('ImageUpdateInput', {
  fields: (t) => ({
    index: t.int({ required: false }),
    parent: t.id({ required: false }),
    tags: t.stringList({ required: false }),
  }),
});

schema.mutationFields((t) => ({
  createImage: t.prismaField({
    type: 'Image',
    description: 'Create a new image.',
    nullable: true,
    args: {
      input: t.arg({
        type: ImageCreateInput,
        description: 'The data to create the image with.',
        required: true,
      }),
    },
    resolve: async (query, root, args, ctx, info) =>
      prisma.image
        .create({
          data: {
            index: args.input.index,
            parent: args.input.parent
              ? {
                  connect: {
                    id:
                      typeof args.input.parent === 'number'
                        ? args.input.parent
                        : parseInt(args.input.parent),
                  },
                }
              : undefined,
            x: args.input.box.x,
            y: args.input.box.y,
            width: args.input.box.width,
            height: args.input.box.height,
            source: { connect: { url: args.input.sourceUrl } },
            tags: args.input.tags
              ? { connect: args.input.tags.map((name) => ({ name })) }
              : undefined,
          },
        })
        .catch(() => null),
  }),

  updateImage: t.prismaField({
    type: 'Image',
    description: 'Update an existing image.',
    nullable: true,
    args: {
      id: t.arg.id({
        required: true,
        description: 'The ID of the image to update.',
      }),

      input: t.arg({
        type: ImageUpdateInput,
        description: 'The data to update the image with.',
        required: true,
      }),
    },
    resolve: async (query, root, args, ctx, info) =>
      prisma.image
        .update({
          where: { id: typeof args.id === 'number' ? args.id : parseInt(args.id) },
          data: {
            index: args.input.index,
            parent: args.input.parent
              ? {
                  connect: {
                    id:
                      typeof args.input.parent === 'number'
                        ? args.input.parent
                        : parseInt(args.input.parent),
                  },
                }
              : undefined,
            tags: args.input.tags
              ? { connect: args.input.tags.map((name) => ({ name })) }
              : undefined,
          },
        })
        .catch(() => null),
  }),

  deleteImage: t.field({
    type: 'Boolean',
    description: 'Delete an existing image.',
    args: {
      id: t.arg.id({
        required: true,
        description: 'The ID of the image to delete.',
      }),
    },
    resolve: async (root, args, ctx, info) =>
      prisma.image
        .delete({
          where: { id: typeof args.id === 'number' ? args.id : parseInt(args.id) },
        })
        .then(() => true)
        .catch(() => false),
  }),
}));
