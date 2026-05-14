/**
 * TP2 - Exercice 4 : Index et Optimisation
 */

use("medical_db");

// ─── 4.1 : Créer les index appropriés ────────────────────────────────────────

// Index 1 : Recherche fréquente par wilaya + antécédents (composé)
db.patients.createIndex(
  { "adresse.wilaya": 1, "antecedents": 1 },
  { name: "idx_wilaya_antecedents" }
);

// Index 2 : Recherche par date de consultation (index sur sous-document)
db.patients.createIndex(
  { "consultations.date": -1 },
  { name: "idx_consultation_date" }
);

// Index 3 : Texte sur diagnostics pour recherche full-text
db.patients.createIndex(
  { "consultations.diagnostic": "text", "consultations.notes": "text" },
  { name: "idx_text_diagnostic" }
);

// Index 4 : Analyses par patient (pour les $lookup)
db.analyses.createIndex(
  { patient_id: 1, date: -1 },
  { name: "idx_analyses_patient" }
);

// Index 5 : CIN unique
db.patients.createIndex({ cin: 1 }, { unique: true, name: "idx_cin_unique" });

// ─── 4.2 : Comparer avec explain() ────────────────────────────────────────────

const requeteTest = {
  "adresse.wilaya": "Alger",
  antecedents: "Diabète type 2"
};

print("=== AVANT index (COLLSCAN) ===");
// Lancer AVANT la création des index pour voir le COLLSCAN
// const avantIndex = db.patients.find(requeteTest).explain("executionStats");
// print("totalDocsExamined:", avantIndex.executionStats.totalDocsExamined);
// print("executionTimeMillis:", avantIndex.executionStats.executionTimeMillis);

print("\n=== APRÈS index (IXSCAN) ===");
const apresIndex = db.patients.find(requeteTest).explain("executionStats");
print("nReturned:", apresIndex.executionStats.nReturned);
print("totalDocsExamined:", apresIndex.executionStats.totalDocsExamined);
print("executionTimeMillis:", apresIndex.executionStats.executionTimeMillis);
print("Stage utilisé:", apresIndex.executionStats.executionStages.inputStage?.stage ?? apresIndex.executionStats.executionStages.stage);

// ─── 4.3 : Liste des index créés ──────────────────────────────────────────────
print("\n=== Index sur patients ===");
printjson(db.patients.getIndexes());
print("\n=== Index sur analyses ===");
printjson(db.analyses.getIndexes());

// ─── 4.4 : Index TTL pour archivage (analyses expirent après 5 ans) ───────────
db.analyses.createIndex(
  { date: 1 },
  {
    expireAfterSeconds: 5 * 365 * 24 * 3600,  // 5 ans = 157 680 000 secondes
    name: "idx_ttl_analyses_5ans"
  }
);

print("\n✅ Tous les index ont été créés avec succès.");
