const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const port = process.env.PORT || 4003;

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: resolvers,
  graphiql: true,
}));

app.listen(port, () => {
  console.log(`Compagnie Assurance service running on port ${port}`);
});
