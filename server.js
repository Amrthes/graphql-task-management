
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const path = require('path');
const { schema, root } = require('./schema');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
);

app.listen(PORT, () => {
  console.log(
    `SUCCESS: Server running at http://localhost:${PORT}`
  );
});
