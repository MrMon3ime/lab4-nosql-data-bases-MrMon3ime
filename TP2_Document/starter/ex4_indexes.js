/**
 * TP2 - Exercice 4 : Index et Optimisation
 */

use("medical_db");

db.patients.createIndex(
  { "adresse.wilaya": 1, "antecedents": 1 },
  { name: "idx_wilaya_antecedents" }
);

db.patients.createIndex(
  { "consultations.date": -1 },
  { name: "idx_consultation_date" }
);

db.patients.createIndex(
  { "consultations.diagnostic": "text", "consultations.notes": "text" },
  { name: "idx_text_diagnostic" }
);

db.analyses.createIndex(
  { patient_id: 1, date: -1 },
  { name: "idx_analyses_patient" }
);

db.patients.createIndex({ cin: 1 }, { unique: true, name: "idx_cin_unique" });


const requeteTest = {
  "adresse.wilaya": "Alger",
  antecedents: "Diabète type 2"
};

print("=== AVANT index (COLLSCAN) ===");

print("\n=== APRÈS index (IXSCAN) ===");
const apresIndex = db.patients.find(requeteTest).explain("executionStats");
print("nReturned:", apresIndex.executionStats.nReturned);
print("totalDocsExamined:", apresIndex.executionStats.totalDocsExamined);
print("executionTimeMillis:", apresIndex.executionStats.executionTimeMillis);
print("Stage utilisé:", apresIndex.executionStats.executionStages.inputStage?.stage ?? apresIndex.executionStats.executionStages.stage);

print("\n=== Index sur patients ===");
printjson(db.patients.getIndexes());
print("\n=== Index sur analyses ===");
printjson(db.analyses.getIndexes());

db.analyses.createIndex(
  { date: 1 },
  {
    expireAfterSeconds: 5 * 365 * 24 * 3600,  // 5 ans = 157 680 000 secondes
    name: "idx_ttl_analyses_5ans"
  }
);

print("\n✅ Tous les index ont été créés avec succès.");
