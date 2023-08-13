import { schema } from './builder.js';

import './types/box.js';
import './types/image.js';
import './types/source.js';
import './types/tag.js';

export const graphSchema = schema.toSchema();
