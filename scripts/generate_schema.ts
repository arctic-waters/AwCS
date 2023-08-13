import * as fs from 'fs/promises';
import { printSchema } from 'graphql';
import * as path from 'path';

// @ts-ignore
import { graphSchema } from '../src/schema';

await fs.writeFile(path.join('schema', 'schema.graphql'), printSchema(graphSchema));

console.log('Wrote schema.graphql');
