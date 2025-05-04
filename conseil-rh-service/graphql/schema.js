const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type Conseil_rh {
    id_conseillerRH: String!
    nom: String!
  }

  type Dossier {
    id_dossier: Int!
    nom_beneficiaire: String!
    date_mja: String
    numero_employe: String
    id_conseillerRH: String
  }

  type Notification {
    id_Notification: String!
    id_Compagnie: String
    dateEnvoi: String
    contenu: String
    id_dossier: Int
  }

  type Employe {
    numero_employe: String!
    nom: String
    email: String
    numero_assurance: String
  }


  type Query {
    getConseiller(id_conseillerRH: String!): Conseil_rh
    getAllConseillers: [Conseil_rh]
    demandeInfoEmploye(numero_employe: String!): Employe
    getDossier(id_dossier: Int!): Dossier
    getNotificationsByCompagnie(id_Compagnie: String!): [Notification]
  }

  type Mutation {
    createConseiller(id_conseillerRH: String!, nom: String!): Conseil_rh
    updateConseiller(id_conseillerRH: String!, nom: String!): Conseil_rh
    deleteConseiller(id_conseillerRH: String!): String

    noterNomBeneficiaire(id_dossier: Int!, nom_beneficiaire: String!, date_mja: String,numero_employe: String,id_conseillerRH:String): Dossier
    notifierCompAssurance(id_Notification: String!, id_Compagnie: String!, contenu: String!, id_dossier: Int!): Notification
  }
`);
