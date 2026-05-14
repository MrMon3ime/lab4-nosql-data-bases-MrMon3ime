// TP4 - Exercice 3 : Algorithmes de Graphe avec GDS
// Prérequis : Plugin Graph Data Science installé (inclus dans docker-compose)

// ─── 3.1 : Plus court chemin ──────────────────────────────────────────────────
// "Comment Ahmed peut-il rencontrer Zineb ?"
MATCH p = shortestPath(
  (a:Etudiant {prenom: "Ahmed"})-[:CONNAIT*..10]-(b:Etudiant {prenom: "Zineb"})
)
RETURN [n IN nodes(p) | n.prenom + " (" + n.universite + ")"] AS chemin,
       length(p) AS nb_intermediaires;


// ─── 3.2 : Centralité de degré ────────────────────────────────────────────────
// Créer la projection du graphe en mémoire
CALL gds.graph.project(
  'reseau_social',
  'Etudiant',
  'CONNAIT'
);

// Top 10 des étudiants les plus connectés
CALL gds.degree.stream('reseau_social')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).prenom AS etudiant,
       gds.util.asNode(nodeId).universite AS universite,
       score AS nb_connexions
ORDER BY score DESC
LIMIT 10;


// ─── 3.3 : Détection de communautés (Louvain) ────────────────────────────────
CALL gds.louvain.stream('reseau_social')
YIELD nodeId, communityId
WITH communityId, collect(gds.util.asNode(nodeId).prenom) AS membres
RETURN communityId,
       size(membres) AS taille,
       membres[0..5] AS exemple_membres
ORDER BY taille DESC;


// ─── 3.4 : Recommandation de contacts ────────────────────────────────────────
// "Qui Ahmed devrait-il connaître ?"
// Score = nb_amis_communs * 3 + nb_cours_communs * 2 + (meme_filiere ? 1 : 0)
MATCH (moi:Etudiant {prenom: "Ahmed"})

// Candidats : pas encore connus, pas Ahmed lui-même
MATCH (candidat:Etudiant)
WHERE candidat <> moi
  AND NOT (moi)-[:CONNAIT]-(candidat)

// Amis en commun
OPTIONAL MATCH (moi)-[:CONNAIT]-(:Etudiant)-[:CONNAIT]-(candidat)
WITH moi, candidat, count(DISTINCT candidat) AS nb_amis_communs

// Cours en commun
OPTIONAL MATCH (moi)-[:SUIT]->(c:Cours)<-[:SUIT]-(candidat)
WITH moi, candidat, nb_amis_communs, count(DISTINCT c) AS nb_cours_communs

// Calculer le score total
WITH candidat,
     nb_amis_communs * 3 + nb_cours_communs * 2 +
       CASE WHEN candidat.filiere = moi.filiere THEN 1 ELSE 0 END AS score,
     nb_amis_communs, nb_cours_communs

WHERE score > 0
RETURN candidat.prenom + " " + candidat.nom AS suggestion,
       candidat.universite AS universite,
       nb_amis_communs, nb_cours_communs, score
ORDER BY score DESC
LIMIT 5;


// ─── 3.5 : Chemin de compétences ─────────────────────────────────────────────
// "Quels cours mènent à Machine Learning ?"
MATCH path = (debut:Cours)-[:REQUIERT*]->(but:Competence {nom: "Machine Learning"})
RETURN [n IN nodes(path) |
  CASE WHEN n:Cours THEN n.intitule ELSE n.nom END
] AS parcours_apprentissage;


// Nettoyage de la projection mémoire
CALL gds.graph.drop('reseau_social');
