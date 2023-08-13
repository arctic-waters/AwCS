import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { Router } from 'express';
import { graphSchema } from '../schema/index.js';

export async function configure(router: Router) {
  const server = new ApolloServer({
    schema: graphSchema,
  });

  await server.start();

  router.use('/graphql', expressMiddleware(server, {}));

  if (process.env.NODE_ENV !== 'production') {
    router.get('/sandbox', (req, res) => {
      res.send(`
        <div style="width: 100%; height: 100%;" id='embedded-sandbox'></div>
        <script src="https://embeddable-sandbox.cdn.apollographql.com/_latest/embeddable-sandbox.umd.production.min.js"></script> 
        <script>
          new window.EmbeddedSandbox({
            target: '#embedded-sandbox',
            initialEndpoint: 'http://localhost:3000/api/graphql',
          });
        </script>
      `);
    });
  }
}
