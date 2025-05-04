const db = require('../db/connection');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { text } = require('express');

require('dotenv').config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI,
);

const auth = {
    type: 'OAuth2',
    user: 'ramaminirinavictorino@gmail.com',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
};


oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });


const EMPLOYE_SERVICE_URL = 'http://employe-service:4001/graphql';
const COMPAGNIE_SERVICE_URL = 'http://compagnie-assurance-service:4003/graphql';
const CONSEIL_RH_SERVICE_URL = 'http://conseil-rh-service:4002/graphql';

const sendMail = async(toEmail, subject, text) => {
  try{
      const accessToken = await oAuth2Client.getAccessToken();
      let token = await accessToken.token;

      const transport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              ...auth,
              accessToken: token,
          },
          tls: {
              rejectUnauthorized: false
          }
      });

      const mailOptions = {
          ...{    
              to: toEmail,
              from: 'ramaminiravictorino@gmail.com',
              subject: subject,
          },
          text: text
      };

      const result = await transport.sendMail(mailOptions);
      console.log(result);
  }
  catch(error){
      console.log(error);
  }
}

function formatDateFrMadagascar(timestamp) {
  // Appliquer +3 heures (fuseau de Madagascar)
  const date = new Date(timestamp + 3 * 60 * 60 * 1000);

  const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  const jourSemaine = jours[date.getUTCDay()];
  const jour = String(date.getUTCDate()).padStart(2, '0');
  const moisNom = mois[date.getUTCMonth()];
  const annee = date.getUTCFullYear();

  return `${jourSemaine} ${jour} ${moisNom} ${annee}`;
}


module.exports = {
  getConseiller: ({ id_conseillerRH }) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM Conseil_rh WHERE id_conseillerRH = ?', [id_conseillerRH], (err, res) => {
        if (err) reject(err);
        resolve(res[0]);
      });
    });
  },

  getAllConseillers: () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM Conseil_rh', (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });
  },

  createConseiller: ({ id_conseillerRH, nom }) => {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO Conseil_rh SET ?', { id_conseillerRH, nom }, (err) => {
        if (err) reject(err);
        resolve({ id_conseillerRH, nom });
      });
    });
  },

  updateConseiller: ({ id_conseillerRH, nom }) => {
    return new Promise((resolve, reject) => {
      db.query('UPDATE Conseil_rh SET nom = ? WHERE id_conseillerRH = ?', [nom, id_conseillerRH], (err) => {
        if (err) reject(err);
        resolve({ id_conseillerRH, nom });
      });
    });
  },

  deleteConseiller: ({ id_conseillerRH }) => {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM Conseil_rh WHERE id_conseillerRH = ?', [id_conseillerRH], (err) => {
        if (err) reject(err);
        resolve("Conseiller supprimé");
      });
    });
  },

  demandeInfoEmploye: async ({ numero_employe }) => {
    try {
        const employeRes = await axios.post(EMPLOYE_SERVICE_URL, {
                    query: `
                      query {
                        getEmploye(numero_employe: "${numero_employe}") {
                          nom,
                          email,
                          numero_assurance
                        }
                      }
                    `
                  });
        
                  const employe = employeRes.data.data.getEmploye;
                  return {
                    numero_employe: numero_employe,
                    nom: employe.nom,
                    email: employe.email,
                    numero_assurance: employe.numero_assurance
                  }

    } catch (error) {
      console.error(error);
    }
  },

  noterNomBeneficiaire: ({ id_dossier, nom_beneficiaire, date_mja, numero_employe, id_conseillerRH }) => {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO Dossier_assurance(id_dossier, nom_beneficiaire, date_mja, numero_employe, id_conseillerRH) VALUES(?,?,?,?,?)', [id_dossier, nom_beneficiaire, date_mja, numero_employe, id_conseillerRH], (err) => {
        if (err) reject(err);
        resolve({ id_dossier, nom_beneficiaire });
      });
    });
  },
  getDossier: ({ id_dossier }) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM Dossier_assurance WHERE id_dossier = ?', [parseInt(id_dossier)], (err, res) => {
        if (err) reject(err);
        res[0].date_mja = formatDateFrMadagascar(res[0].date_mja);
        resolve(res[0]);
      });
    });
  },
  
  notifierCompAssurance: async({ id_Notification, id_Compagnie, contenu, id_dossier }) => {
    try {
      const assur_comp = await axios.post(COMPAGNIE_SERVICE_URL, {
        query: `
          query GetCompagnie {
              getCompagnie(id: "${id_Compagnie}") {
                  email
              }
          } `
      });
      const emailCom = assur_comp.data.data.getCompagnie.email;
      
      const dossierSer = await axios.post(CONSEIL_RH_SERVICE_URL, {
        query: `
         query GetDossier {
              getDossier(id_dossier: ${id_dossier}) {
                  numero_employe
              }
          }`
      });
      const numero_employe = dossierSer.data.data.getDossier.numero_employe;

      const employeResE = await axios.post(EMPLOYE_SERVICE_URL, {
        query: `
         query GetEmploye {
            getEmploye(numero_employe: "${numero_employe}") {
                email
                nom
            }
        }`
      });
      const emailEmp = employeResE.data.data.getEmploye.email;
      const nomEmp = employeResE.data.data.getEmploye.nom;

      return new Promise((resolve, reject) => {
        const dateEnvoi = new Date().toISOString().slice(0, 10);
        const notification = { id_Notification, id_Compagnie, dateEnvoi, contenu, id_dossier };
        db.query('INSERT INTO Notification SET ?', notification, (err) => {
          if (err) reject(err);
          const textEmp = "Bonjour Mr/Mme " + nomEmp + ", Votre dossier a été traité avec succès.";
          const textComp = "Bonjour, Cet email vous informe que le dossier d'assurance de " + nomEmp + " a été traité avec succès. Merci de nous contacter si vous avez des questions, Compagnie : " + id_Compagnie + ".";
          sendMail(emailEmp,"CONFIRMATION DE DEMANDE", textEmp);
          sendMail(emailCom,"DOSSIER D'ASSURANCE : " + nomEmp, textComp);
          resolve(notification);
        });
      });
    } catch (error) {
      console.error(error);
    }
  },
  getNotificationsByCompagnie: ({ id_Compagnie }) => {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM Notification WHERE id_Compagnie = ?',
        [id_Compagnie],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },
};
