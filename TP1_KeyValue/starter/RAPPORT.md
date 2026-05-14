# RAPPORT TP1 — Redis : Système de Cache E-commerce

## 1. Structures de données utilisées

| Structure Redis | Clé | Usage |
|---|---|---|
| **Hash** | `product:{id}` | Stocker les champs d'un produit (name, price, stock…) |
| **Hash** | `cart:{user_id}` | Panier : clés = product_id, valeurs = quantités |
| **List** | `history:{user_id}` | Historique de navigation (LPUSH + LTRIM) |
| **Set** | `category:{cat}` | Ensemble de produits par catégorie |
| **Sorted Set** | `leaderboard:sales` | Classement des ventes (score = nb ventes) |
| **String** | `product_cache:{id}` | Cache JSON des produits avec TTL |

## 2. Exercice 1 — Structures de base

- `store_product` : `HSET product:{id} name ... price ...` — O(N) champs
- `get_product` : `HGETALL product:{id}` — retourne None si clé inexistante
- `add_to_cart` : `HINCRBY cart:{user_id} {product_id} {qty}` — atomique, pas de race condition
- `record_view` : `LPUSH` + `LTRIM` — maintient les N derniers éléments
- `get_products_in_categories` : `SINTER category:A category:B` — intersection d'ensembles en O(N×M)

## 3. Exercice 3 — Pattern Cache-Aside

### Flux d'exécution
```
Client → Redis (GET) →
  HIT  → retourner JSON désérialisé  (< 1ms)
  MISS → PostgreSQL (2000ms) → Redis (SETEX + TTL) → retourner
```

### Résultats typiques
| Appel | Type | Latence |
|---|---|---|
| Premier | MISS | ~2001 ms |
| Suivants | HIT | < 1 ms |

- **Gain de performance** : ×2000 sur les accès suivants
- **TTL = 600s** : évite les données obsolètes (10 minutes de cache)
- `invalidate_product_cache` à appeler après chaque UPDATE en DB

## 4. Exercice 4 — Leaderboard (Sorted Set)

- `ZINCRBY` : incrémentation atomique du score (thread-safe)
- `ZREVRANGE ... WITHSCORES` : top N en O(log N + N)
- `ZREVRANK` : rang en O(log N), converti en 1-based
- Avantage : mise à jour en temps réel sans recalcul du classement

## 5. Bonnes pratiques appliquées

- Nommage des clés : `entite:identifiant:champ` (namespace clair)
- TTL sur les caches pour éviter la saturation mémoire
- `decode_responses=True` pour éviter la gestion manuelle des bytes
- Pipeline Redis pour les opérations en lot (TP5)

## 6. Conclusion

Redis excelle pour les données à accès fréquent, faible latence requise, et structures simples. Le pattern Cache-Aside réduit la charge DB de 95%+ sur des données chaudes.
