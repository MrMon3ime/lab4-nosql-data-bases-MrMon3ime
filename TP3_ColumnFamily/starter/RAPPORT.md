# RAPPORT TP3 — Cassandra : IoT SmartGrid DZ

## 1. Modélisation orientée requêtes

Principe fondamental Cassandra : **concevoir le schéma à partir des requêtes, pas des entités**.

### Table 1 : `mesures_par_capteur`
**Requête cible** : "Mesures du capteur X entre T1 et T2"

```cql
PRIMARY KEY ((capteur_id, date_jour), timestamp)
```

- **Partition key composite** : `(capteur_id, date_jour)` — bucket journalier
- **Clustering key** : `timestamp DESC` — mesures récentes en premier
- **Pourquoi le bucketing ?** Sans `date_jour`, une partition par `capteur_id` contiendrait 10 000 capteurs × 365 jours × 1440 min/jour = 5,2 milliards de lignes → hot partition ingérable. Le bucket journalier limite à 1440 lignes/partition.
- **TTL = 90 jours** : suppression automatique des données anciennes

### Table 2 : `alertes_par_wilaya`
**Requête cible** : "Alertes de la wilaya X le jour Y"

```cql
PRIMARY KEY ((wilaya, date_jour), timestamp, capteur_id)
```

- Toutes les alertes d'une wilaya pour un jour en une seule partition
- Tri par timestamp DESC pour afficher les plus récentes

### Table 3 : `agregats_horaires`
**Requête cible** : "Dashboard consommation wilaya"

```cql
PRIMARY KEY (wilaya, date_heure)
```

- Une partition par wilaya (5 wilayas = charge équilibrée)
- Accès O(1) aux statistiques horaires sans calcul à la volée

## 2. Ingestion de données

### Stratégie : UNLOGGED BATCH de 50 éléments
- **UNLOGGED** (vs LOGGED) : pas de journal de coordination → ×3 à ×5 plus rapide pour les séries temporelles
- **Batch de 50** : limite recommandée Cassandra pour éviter les timeouts et la pression coordonnateur
- **Prepared statements** : compilation une seule fois, réutilisée → réduit le parsing CQL

### Performance attendue
| Métrique | Valeur |
|---|---|
| Volume total | 50 000 mesures (10 000 capteurs × 5 min) |
| Débit attendu | > 5 000 mesures/s |
| Durée estimée | < 10s |

## 3. Choix de Cassandra pour ce use case

| Critère | Cassandra | Alternative |
|---|---|---|
| Débit d'écriture | ✅ Excellent (log-structured) | MongoDB : correct |
| Scalabilité horizontale | ✅ Linéaire | Redis : limité |
| Haute disponibilité | ✅ Pas de master | MongoDB : réplication |
| Requêtes complexes | ❌ Limité (pas de JOIN) | MongoDB : meilleur |
| Séries temporelles | ✅ Optimisé | InfluxDB : comparable |

## 4. Conclusion

Cassandra est le choix optimal pour l'IoT à grande échelle : écriture massivement parallèle, TTL natif pour la rétention, et partitionnement précis pour éviter les hot spots. La contrainte principale est de **concevoir le schéma à l'avance** selon les patterns d'accès.
