import { prisma } from '../../services/prisma.js';
import { schema } from '../builder.js';

schema.prismaObject('Tag', {
  fields: (t) => ({
    name: t.exposeString('name', {
      description: 'The unique name of the tag.',
    }),

    description: t.exposeString('description', {
      nullable: true,
      description: 'The description of the tag.',
    }),

    images: t.relation('images', {
      description: 'All the images that have this tag.',
    }),
  }),
});

schema.queryFields((t) => ({
  tags: t.prismaField({
    type: ['Tag'],
    description: 'All available tags.',
    resolve: async (query, root, args, ctx, info) => prisma.tag.findMany(),
  }),

  tag: t.prismaField({
    type: 'Tag',
    description: 'Get a tag by its name.',
    nullable: true,
    args: {
      name: t.arg.string({
        required: true,
        description: 'The name of the tag.',
      }),
    },
    resolve: async (query, root, args, ctx, info) =>
      prisma.tag.findUnique({
        where: { name: args.name },
      }),
  }),
}));

schema.mutationFields((t) => ({
  createTag: t.prismaField({
    type: 'Tag',
    description: 'Create a new tag with the given name and an optional description.',
    args: {
      name: t.arg.string({
        required: true,
        description: 'The name of the tag.',
      }),

      description: t.arg.string({
        required: false,
        description: 'The description of the tag.',
      }),
    },
    resolve: async (query, root, args, ctx, info) =>
      prisma.tag.create({
        data: {
          name: args.name,
          description: args.description,
        },
      }),
  }),

  updateTag: t.prismaField({
    type: 'Tag',
    nullable: true,
    description: 'Update the description of a tag.',
    args: {
      name: t.arg.string({
        required: true,
        description: 'The name of the tag.',
      }),

      description: t.arg.string({
        required: false,
        description: 'The new description of the tag.',
      }),
    },
    resolve: async (query, root, args, ctx, info) =>
      await prisma.tag
        .update({
          where: { name: args.name },
          data: { description: args.description },
        })
        .catch(() => null),
  }),

  deleteTag: t.field({
    type: 'Boolean',
    description: 'Delete a tag by its name.',
    args: {
      name: t.arg.string({
        required: true,
        description: 'The name of the tag.',
      }),
    },
    resolve: async (root, args, ctx, info) =>
      prisma.tag
        .delete({ where: { name: args.name } })
        .then(() => true)
        .catch(() => false),
  }),
}));
