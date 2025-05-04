CREATE TABLE IF NOT EXISTS Conseil_rh (
    id_conseillerRH VARCHAR(255) PRIMARY KEY,
    nom VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Dossier_assurance (
    id_dossier INT PRIMARY KEY AUTO_INCREMENT,
    nom_beneficiaire VARCHAR(255) NOT NULL,
    date_mja DATE,
    numero_employe VARCHAR(255),
    id_conseillerRH VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Notification (
    id_Notification VARCHAR(255) PRIMARY KEY,
    id_Compagnie VARCHAR(255),
    dateEnvoi DATE,
    contenu VARCHAR(255),
    id_dossier INT
);
