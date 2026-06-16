-- Schéma de la table `articles` aligné sur le contrat attendu par le front-end
-- (frontend/src/types/article.ts).
--
-- À exécuter sur la base `veille` de la VM Debian (192.168.1.25), p.ex. :
--   mysql -h 192.168.1.25 -u adminbb -p veille < schema.sql
--
-- Le champ `tags` est stocké en JSON (tableau de chaînes). L'API doit exposer
-- la colonne `date_publication` sous le nom `date` au format ISO 8601, et
-- désérialiser `tags` en tableau JSON.

CREATE TABLE IF NOT EXISTS articles (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    titre            VARCHAR(512)  NOT NULL,
    source           VARCHAR(255)  NOT NULL DEFAULT '',
    date_publication DATETIME      NOT NULL,
    resume           TEXT,
    lien             VARCHAR(1024) NOT NULL,
    score            DECIMAL(4,3)  NOT NULL DEFAULT 0.000,  -- 0.000 – 1.000
    is_top           TINYINT(1)    NOT NULL DEFAULT 0,
    tags             JSON,
    cree_le          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_lien (lien)   -- support du INSERT IGNORE (déduplication)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------------
-- MIGRATION d'une table `articles` existante (titre, date_publication,
-- resume, lien) vers le nouveau schéma. Exécuter ces ALTER si la table
-- existe déjà sans les nouvelles colonnes :
-- -------------------------------------------------------------------------
-- ALTER TABLE articles
--     ADD COLUMN source VARCHAR(255) NOT NULL DEFAULT '' AFTER titre,
--     ADD COLUMN score  DECIMAL(4,3) NOT NULL DEFAULT 0.000 AFTER lien,
--     ADD COLUMN is_top TINYINT(1)   NOT NULL DEFAULT 0 AFTER score,
--     ADD COLUMN tags   JSON AFTER is_top,
--     ADD UNIQUE KEY uniq_lien (lien);
