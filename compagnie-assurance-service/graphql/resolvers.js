const db = require('../db/connection');
const axios = require('axios');

const EMPLOYE_SERVICE_URL = 'http://employe-service:4001/graphql';
const CONSEIL_RH_SERVICE_URL = 'http://conseil-rh-service:4002/graphql';

function formatDateFrMadagascar(timestamp) {
  // Appliquer +3 heures (fuseau de Madagascar)
  const date = new Date(parseInt(timestamp) + 3 * 60 * 60 * 1000);

  const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  const jourSemaine = jours[date.getUTCDay()];
  const jour = String(date.getUTCDate()).padStart(2, '0');
  const moisNom = mois[date.getUTCMonth()];
  const annee = date.getUTCFullYear();

  return `${jourSemaine} ${jour} ${moisNom} ${annee}`;
}



module.exports = {
  getCompagnie: ({ id }) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM Compagnie_assurance WHERE id = ?', [id], (err, res) => {
        if (err) reject(err);
        resolve(res[0]);
      });
    });
  },

  getAllCompagnies: () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM Compagnie_assurance', (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });
  },

  createCompagnie: ({ id, nom, email }) => {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO Compagnie_assurance SET ?', { id, nom, email }, (err) => {
        if (err) reject(err);
        resolve({ id, nom, email });
      });
    });
  },

  updateCompagnie: ({ id, nom, email }) => {
    return new Promise((resolve, reject) => {
      db.query('UPDATE Compagnie_assurance SET nom = ?, email = ? WHERE id = ?', [nom, email, id], (err) => {
        if (err) reject(err);
        resolve({ id, nom, email });
      });
    });
  },

  deleteCompagnie: ({ id }) => {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM Compagnie_assurance WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        resolve("Compagnie supprimée");
      });
    });
  },

  consulterNotifications: async ({ id_Compagnie }) => {
    try {
      
      const notifRes = await axios.post(CONSEIL_RH_SERVICE_URL, {
        query: `
          query GetAllConseillers {
              getNotificationsByCompagnie(id_Compagnie: "${id_Compagnie}") {
                  id_Notification
                  id_Compagnie
                  dateEnvoi
                  contenu
                  id_dossier
              }
          }
        `
      });

      // console.log(notifRes.data.data.getNotificationsByCompagnie)
      const notifications = notifRes.data.data.getNotificationsByCompagnie;
      
      const results = await Promise.all(notifications.map(async (notif) => {
        try {
          const dossierRes = await axios.post(CONSEIL_RH_SERVICE_URL, {
            query: `
              query {
                getDossier(id_dossier: ${notif.id_dossier}) {
                  nom_beneficiaire
                  numero_employe
                }
              }
            `
          });

          const dossier = dossierRes.data.data.getDossier;

          const employeRes = await axios.post(EMPLOYE_SERVICE_URL, {
            query: `
              query {
                getEmploye(numero_employe: "${dossier.numero_employe}") {
                  nom
                }
              }
            `
          });

          const employe = employeRes.data.data.getEmploye;
          return {
            id_Notification: notif.id_Notification,
            id_Compagnie: id_Compagnie,
            contenu: notif.contenu,
            dateEnvoi: formatDateFrMadagascar(notif.dateEnvoi),
            nom_beneficiaire: dossier.nom_beneficiaire,
            nom_proprietaire: employe.nom,
          };
        } catch (e) {
          console.error('Erreur lors de l’appel interservice :', e.message);
          return null;
        }
      }));

      return results.filter(r => r !== null);
    } catch (err) {
      console.error('Erreur globale consulterNotifications :', err.message);
      throw new Error('Impossible de récupérer les notifications');
    }
  }
};
