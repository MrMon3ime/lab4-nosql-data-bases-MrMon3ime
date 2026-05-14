-- TP3 - Exercice 1 : Schéma Cassandra
-- Use Case : SmartGrid DZ - IoT Électrique

-- ─── 1.1 : Créer le Keyspace ──────────────────────────────────────────────────
-- Pour le TP local : replication_factor = 1
-- En production avec 3 nœuds : NetworkTopologyStrategy, factor = 3

CREATE KEYSPACE IF NOT EXISTS smartgrid
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

-- Pour la production multi-datacenter :
-- CREATE KEYSPACE IF NOT EXISTS smartgrid
-- WITH replication = {
--   'class': 'NetworkTopologyStrategy',
--   'datacenter1': 3
-- };

USE smartgrid;

-- ─── 1.2 : Table mesures_par_capteur ──────────────────────────────────────────
-- Requête cible : "Mesures du capteur X entre T1 et T2"
-- Stratégie anti hot-partition : on boucketise par jour (date_jour)
-- Partition key : (capteur_id, date_jour) → répartit la charge sur les nœuds
-- Clustering key : timestamp DESC → accès aux mesures récentes en premier

CREATE TABLE IF NOT EXISTS mesures_par_capteur (
  capteur_id   UUID,
  date_jour    DATE,        -- bucket journalier → évite les hot partitions
  timestamp    TIMESTAMP,
  wilaya       TEXT,
  commune      TEXT,
  tension_v    FLOAT,
  courant_a    FLOAT,
  puissance_kw FLOAT,
  frequence_hz FLOAT,
  temperature  FLOAT,
  alerte       BOOLEAN,
  code_alerte  TEXT,
  PRIMARY KEY ((capteur_id, date_jour), timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC)
  AND default_time_to_live = 7776000;  -- 90 jours en secondes


-- ─── 1.3 : Table alertes_par_wilaya ───────────────────────────────────────────
-- Requête cible : "Alertes de la wilaya X le jour Y"
-- Partition key : (wilaya, date_jour) → toutes les alertes d'une wilaya pour un jour
-- Clustering key : timestamp DESC, capteur_id → tri chronologique inverse

CREATE TABLE IF NOT EXISTS alertes_par_wilaya (
  wilaya       TEXT,
  date_jour    DATE,
  timestamp    TIMESTAMP,
  capteur_id   UUID,
  code_alerte  TEXT,
  description  TEXT,
  gravite      INT,     -- 1=info, 2=warning, 3=critique
  resolue      BOOLEAN,
  PRIMARY KEY ((wilaya, date_jour), timestamp, capteur_id)
) WITH CLUSTERING ORDER BY (timestamp DESC, capteur_id ASC)
  AND default_time_to_live = 31536000;  -- 1 an


-- ─── 1.4 : Table agregats_horaires ────────────────────────────────────────────
-- Requête cible : "Consommation moyenne par heure pour le dashboard wilaya"
-- Partition key : wilaya → dashboard par wilaya
-- Clustering key : date_heure DESC → ordre chronologique inverse

CREATE TABLE IF NOT EXISTS agregats_horaires (
  wilaya            TEXT,
  date_heure        TIMESTAMP,
  nb_capteurs       INT,
  puissance_moy_kw  FLOAT,
  puissance_max_kw  FLOAT,
  puissance_min_kw  FLOAT,
  nb_alertes        INT,
  PRIMARY KEY (wilaya, date_heure)
) WITH CLUSTERING ORDER BY (date_heure DESC)
  AND default_time_to_live = 157680000;  -- 5 ans


-- Vérification
DESCRIBE TABLES;
