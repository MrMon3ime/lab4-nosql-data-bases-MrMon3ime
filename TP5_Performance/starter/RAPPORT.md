# RAPPORT TP5 — Benchmark Comparatif NoSQL

## 1. Environnement de test
- Docker sur machine locale (4 vCPU, 8 GB RAM)
- N = 10 000 enregistrements (100 000 en production)
- Clients : Python 3.11, bibliothèques officielles

## 2. Résultats Écriture

| Base | Débit (ops/s) | Latence moy. | Mécanisme utilisé |
|---|---|---|---|
| **Redis** | ~150 000 | < 0.01ms | Pipeline (1 000 cmds/batch) |
| **MongoDB** | ~25 000 | 0.04ms | bulk_write (InsertOne ×1000) |
| **Cassandra** | ~10 000 | 0.1ms | UNLOGGED BATCH (50/batch) |

**Analyse** : Redis domine car il est in-memory sans persistence forcée. MongoDB utilise le journal WiredTiger. Cassandra a une latence d'écriture plus haute mais une durabilité garantie dès l'acquittement.

## 3. Résultats Lecture

| Base | Opération | Latence p50 | Latence p99 | Throughput |
|---|---|---|---|---|
| **Redis** | HGETALL (point) | 0.1ms | 0.5ms | ~10 000 rps |
| **Redis** | Pipeline ×10 | 0.3ms | 1ms | ~3 300 rps |
| **MongoDB** | find_one (index) | 0.2ms | 1ms | ~5 000 rps |
| **MongoDB** | Range query | 0.5ms | 2ms | ~2 000 rps |
| **MongoDB** | Aggregation | 2ms | 8ms | ~500 rps |

## 4. Charge concurrente (50 clients simultanés)

| Métrique | Redis | MongoDB |
|---|---|---|
| Throughput total | ~40 000 rps | ~15 000 rps |
| Dégradation p99 | ×3 vs single | ×5 vs single |
| Saturation | Non (event loop) | Partielle (pool) |

Redis résiste mieux à la concurrence grâce à son modèle single-threaded + I/O multiplexing. MongoDB dégrade plus sous forte charge due aux verrous WiredTiger.

## 5. Matrice de décision

| Critère | Redis | MongoDB | Cassandra | Neo4j |
|---|---|---|---|---|
| Vitesse écriture | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Vitesse lecture | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Scalabilité | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Requêtes complexes | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Persistance | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Relations | ⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ |

## 6. Recommandations par use case

- **Cache / Session / Leaderboard** → **Redis** (latence sub-ms)
- **Documents hétérogènes / Rapports** → **MongoDB** (flexibilité + agrégation)
- **IoT / Séries temporelles / Haute charge** → **Cassandra** (scalabilité linéaire)
- **Réseaux sociaux / Graphes** → **Neo4j** (traversal natif)

## 7. Conclusion

Il n'existe pas de base NoSQL universelle. Le choix dépend du type de données, des patterns d'accès, et des contraintes de SLA. Les architectures modernes combinent souvent **Redis (cache) + MongoDB (source de vérité) + Cassandra (logs/IoT)**.
