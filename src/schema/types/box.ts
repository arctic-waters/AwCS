import { schema } from '../builder.js';

export class Box {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly width: number,
    readonly height: number,
  ) {}
}

export const BoxInput = schema.inputType('BoxInput', {
  fields: (t) => ({
    x: t.int({ required: true }),
    y: t.int({ required: true }),
    width: t.int({ required: true }),
    height: t.int({ required: true }),
  }),
});

schema.objectType(Box, {
  name: 'Box',
  description: 'A set of dimensions for a rectangle, with an origin at the top left.',
  fields: (t) => ({
    x: t.exposeInt('x', {
      description: 'The x coordinate of the top left corner.',
    }),

    y: t.exposeInt('y', {
      description: 'The y coordinate of the top left corner.',
    }),

    width: t.exposeInt('width', {
      description: 'The width of the box.',
    }),

    height: t.exposeInt('height', {
      description: 'The height of the box.',
    }),
  }),
});
