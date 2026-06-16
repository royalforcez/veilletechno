-- Schéma de la table `articles` aligné sur le contrat attendu par le front-end
-- (frontend/src/types/article.ts) et appliqué sur la base `veille`
-- de la VM (192.168.1.25) le 2026-06-16.
--
-- À exécuter p.ex. :
--   mysql -h 192.168.1.25 -u adminbb -p veille < schema.sql
--
-- Notes :
--  * La déduplication du `INSERT IGNORE` (ingester) repose sur la clé UNIQUE
--    sur `titre` (un même titre n'est pas réinséré).
--  * `tags` est stocké en JSON (tableau de chaînes).
--  * L'API expose `date_publication` sous le nom `date` (ISO 8601) et
--    désérialise `tags` en tableau (cf. api/app.py).

-- Installation neuve -------------------------------------------------------
CREATE TABLE IF NOT EXISTS articles (
    id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titre            VARCHAR(255)  DEFAULT NULL,
    source           VARCHAR(255)  NOT NULL DEFAULT '',
    date_publication TIMESTAMP     NULL DEFAULT NULL,
    resume           TEXT          DEFAULT NULL,
    lien             TEXT          DEFAULT NULL,
    score            DECIMAL(4,3)  NOT NULL DEFAULT 0.000,  -- 0.000 – 1.000
    is_top           TINYINT(1)    NOT NULL DEFAULT 0,
    tags             JSON          DEFAULT NULL,
    UNIQUE KEY titre (titre)       -- support du INSERT IGNORE (déduplication)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Migration d'une table existante (ancien schéma : titre, date_publication,
-- resume, lien) — ALTER réellement appliqué sur la base :
-- -------------------------------------------------------------------------
-- ALTER TABLE articles
--     ADD COLUMN source VARCHAR(255) NOT NULL DEFAULT '' AFTER titre,
--     ADD COLUMN score  DECIMAL(4,3) NOT NULL DEFAULT 0.000 AFTER lien,
--     ADD COLUMN is_top TINYINT(1)   NOT NULL DEFAULT 0 AFTER score,
--     ADD COLUMN tags   JSON AFTER is_top;
