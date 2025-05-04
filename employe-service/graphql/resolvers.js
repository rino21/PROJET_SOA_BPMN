const db = require('../db/connection');

module.exports = {
  getEmploye: ({ numero_employe }) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM Employe WHERE numero_employe = ?', [numero_employe], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  },

  getAllEmployes: () => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM Employe', (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },

  createEmploye: ({ numero_employe, nom, email, numero_assurance }) => {
    return new Promise((resolve, reject) => {
      const employe = { numero_employe, nom, email, numero_assurance };
      db.query('INSERT INTO Employe SET ?', employe, (err) => {
        if (err) reject(err);
        resolve(employe);
      });
    });
  },

  updateEmploye: ({ numero_employe, nom, email, numero_assurance }) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE Employe SET nom = ?, email = ?, numero_assurance = ? WHERE numero_employe = ?';
      db.query(query, [nom, email, numero_assurance, numero_employe], (err) => {
        if (err) reject(err);
        resolve({ numero_employe, nom, email, numero_assurance });
      });
    });
  },

  deleteEmploye: ({ numero_employe }) => {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM Employe WHERE numero_employe = ?', [numero_employe], (err) => {
        if (err) reject(err);
        resolve("Employé supprimé");
      });
    });
  }
};
