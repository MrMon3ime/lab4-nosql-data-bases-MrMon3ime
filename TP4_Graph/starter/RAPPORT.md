# RAPPORT TP4 — Neo4j : Réseau Social UniConnect DZ

## 1. Modèle de graphe

### Nœuds
| Label | Propriétés clés | Count |
|---|---|---|
| `Etudiant` | id, prenom, nom, universite, filiere, annee, ville | 50 |
| `Cours` | code, intitule, credits, departement | 5 |
| `Competence` | nom, categorie | 10 |

### Relations
| Type | De → Vers | Propriétés | Sémantique |
|---|---|---|---|
| `CONNAIT` | Etudiant ↔ Etudiant | — | Lien social (non dirigé) |
| `SUIT` | Etudiant → Cours | note, annee_academique | Inscription cours |
| `MAITRISE` | Etudiant → Competence | niveau (1-5) | Compétence validée |
| `REQUIERT` | Cours → Competence | — | Prérequis du cours |

### Garantie de connectivité
Le graphe CONNAIT est construit comme une chaîne circulaire (E001→E002→…→E050→E001) plus des ponts inter-universités, garantissant qu'il n'y a aucun nœud isolé. Tout étudiant peut atteindre tout autre étudiant.

## 2. Algorithmes de graphe

### 3.1 — Plus court chemin (BFS)
`shortestPath()` utilise l'algorithme de Dijkstra/BFS. La profondeur `*..10` limite la recherche à 10 sauts (suffisant pour 50 nœuds — diamètre théorique ≪ 10).

### 3.2 — Centralité de degré (GDS)
`gds.degree.stream` calcule le nombre de connexions directes de chaque nœud. Les étudiants avec le plus haut degré sont les "hubs sociaux" — influenceurs du réseau.

### 3.3 — Détection de communautés (Louvain)
L'algorithme de Louvain maximise la **modularité** : les nœuds fortement connectés entre eux forment une communauté. Avec notre graphe, on s'attend à des communautés par université ou par filière.

### 3.4 — Recommandation de contacts
Score composite :
```
score = amis_communs × 3 + cours_communs × 2 + (même_filière ? 1 : 0)
```
Pondération : les amis communs ont plus de poids (signal social fort) que les cours communs (signal académique).

### 3.5 — Chemin de compétences
La relation `REQUIERT` entre Cours et Compétence modélise le graphe des prérequis pédagogiques. `shortestPath` ou `*` permet de trouver tous les chemins vers une compétence cible.

## 3. Pourquoi Neo4j pour ce use case ?

| Requête | SQL (3 jointures) | Neo4j (Cypher) |
|---|---|---|
| Amis d'amis (degré 2) | ~500ms (jointure × jointure) | < 10ms (traversal natif) |
| Plus court chemin | Récursion complexe | `shortestPath()` intégré |
| Recommandations | Sous-requêtes corrélées | Pattern matching déclaratif |

La base graphe représente nativement les relations, sans surcoût de jointures. Pour les réseaux sociaux, c'est 10 à 100× plus rapide que SQL sur les requêtes de traversal.

## 4. Conclusion

Neo4j s'impose pour les données hautement relationnelles où **les connexions sont aussi importantes que les données elles-mêmes**. UniConnect DZ bénéficie d'algorithmes de graphe avancés (communautés, centralité, chemin) impossibles ou coûteux avec d'autres paradigmes.
