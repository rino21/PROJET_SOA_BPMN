const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type Employe {
    numero_employe: String!
    nom: String!
    email: String
    numero_assurance: String
  }

  type Query {
    getEmploye(numero_employe: String!): Employe
    getAllEmployes: [Employe]
  }

  type Mutation {
    createEmploye(numero_employe: String!, nom: String!, email: String, numero_assurance: String): Employe
    updateEmploye(numero_employe: String!, nom: String, email: String, numero_assurance: String): Employe
    deleteEmploye(numero_employe: String!): String
  }
`);
