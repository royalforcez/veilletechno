CREATE TABLE IF NOT EXISTS articles (
    id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titre            VARCHAR(255)  DEFAULT NULL,
    source           VARCHAR(255)  NOT NULL DEFAULT '',
    date_publication TIMESTAMP     NULL DEFAULT NULL,
    resume           TEXT          DEFAULT NULL,
    lien             TEXT          DEFAULT NULL,
    score            DECIMAL(4,3)  NOT NULL DEFAULT 0.000,
    is_top           TINYINT(1)    NOT NULL DEFAULT 0,
    tags             JSON          DEFAULT NULL,
    UNIQUE KEY titre (titre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
