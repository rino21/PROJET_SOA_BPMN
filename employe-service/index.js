const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const port = process.env.PORT || 4001;

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: resolvers,
  graphiql: true,
}));

app.listen(port, () => {
  console.log(`Employe service running on port ${port}`);
});
