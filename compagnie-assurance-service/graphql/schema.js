const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type Compagnie {
    id: String!
    nom: String!
    email: String
  }

  type NotificationDetails {
    id_Notification: String!
    id_Compagnie: String
    contenu: String!
    dateEnvoi: String
    nom_proprietaire: String
    nom_beneficiaire: String
  }

  type Query {
    getCompagnie(id: String!): Compagnie
    getAllCompagnies: [Compagnie]
    consulterNotifications(id_Compagnie: String): [NotificationDetails]
  }

  type Mutation {
    createCompagnie(id: String!, nom: String!, email: String): Compagnie
    updateCompagnie(id: String!, nom: String, email: String): Compagnie
    deleteCompagnie(id: String!): String
  }
`);
