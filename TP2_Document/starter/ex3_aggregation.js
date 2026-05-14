/**
 * TP2 - Exercice 3 : Pipelines d'Agrégation
 * Use Case : Statistiques médicales HealthCare DZ
 */

use("medical_db");

// ─── 3.1 : Distribution des diagnostics par wilaya ────────────────────────────
print("=== 3.1 : Top diagnostics par wilaya ===");

const diagParWilaya = db.patients.aggregate([
  { $unwind: "$consultations" },
  { $group: {
      _id: { wilaya: "$adresse.wilaya", diagnostic: "$consultations.diagnostic" },
      count: { $sum: 1 }
  }},
  { $sort: { count: -1 } },
  { $limit: 20 }
]).toArray();

printjson(diagParWilaya);

// ─── 3.2 : Médicament le plus prescrit par spécialité ─────────────────────────
print("\n=== 3.2 : Top médicaments par spécialité ===");

const medsParSpecialite = db.patients.aggregate([
  { $unwind: "$consultations" },
  { $unwind: "$consultations.medicaments" },
  { $group: {
      _id: {
        specialite: "$consultations.medecin.specialite",
        medicament: "$consultations.medicaments.nom"
      },
      count: { $sum: 1 }
  }},
  { $sort: { "_id.specialite": 1, count: -1 } },
  { $group: {
      _id: "$_id.specialite",
      top_medicament: { $first: "$_id.medicament" },
      prescriptions: { $first: "$count" }
  }},
  { $sort: { prescriptions: -1 } }
]).toArray();

printjson(medsParSpecialite);

// ─── 3.3 : Évolution mensuelle des consultations ──────────────────────────────
print("\n=== 3.3 : Consultations par mois (12 derniers mois) ===");

const evolutionMensuelle = db.patients.aggregate([
  { $unwind: "$consultations" },
  { $match: {
    "consultations.date": {
      $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
    }
  }},
  { $group: {
      _id: {
        annee: { $year: "$consultations.date" },
        mois:  { $month: "$consultations.date" }
      },
      nb_consultations: { $sum: 1 }
  }},
  { $sort: { "_id.annee": 1, "_id.mois": 1 } },
  { $project: {
      _id: 0,
      periode: {
        $concat: [
          { $toString: "$_id.annee" }, "-",
          { $cond: [{ $lt: ["$_id.mois", 10] }, { $concat: ["0", { $toString: "$_id.mois" }] }, { $toString: "$_id.mois" }] }
        ]
      },
      nb_consultations: 1
  }}
]).toArray();

printjson(evolutionMensuelle);

// ─── 3.4 : Patients à risque multiple ────────────────────────────────────────
print("\n=== 3.4 : Profil patients à risque élevé ===");

const patientsRisque = db.patients.aggregate([
  {
    $match: {
      antecedents: { $all: ["Diabète type 2", "HTA"] },
      $expr: {
        $lt: [
          { $dateToString: { format: "%Y-%m-%d", date: "$dateNaissance" } },
          { $dateToString: { format: "%Y-%m-%d", date: new Date(new Date().setFullYear(new Date().getFullYear() - 60)) } }
        ]
      }
    }
  },
  { $addFields: {
      age: {
        $floor: {
          $divide: [
            { $subtract: [new Date(), "$dateNaissance"] },
            1000 * 60 * 60 * 24 * 365
          ]
        }
      },
      nb_consultations: { $size: "$consultations" },
      nb_antecedents: { $size: "$antecedents" }
  }},
  { $project: {
      _id: 0, nom: 1, prenom: 1, age: 1,
      antecedents: 1, nb_consultations: 1, nb_antecedents: 1,
      "adresse.wilaya": 1
  }}
]).toArray();

printjson(patientsRisque);

// ─── 3.5 : Rapport médecins ───────────────────────────────────────────────────
print("\n=== 3.5 : Top 5 médecins & taux de ré-consultation ===");

const rapportMedecins = db.patients.aggregate([
  { $unwind: "$consultations" },
  { $group: {
      _id: "$consultations.medecin.nom",
      specialite: { $first: "$consultations.medecin.specialite" },
      total_consultations: { $sum: 1 },
      patients_uniques: { $addToSet: "$_id" }
  }},
  { $addFields: {
      nb_patients_uniques: { $size: "$patients_uniques" },
      taux_reconsultation: {
        $multiply: [
          { $divide: [
              { $subtract: ["$total_consultations", { $size: "$patients_uniques" }] },
              { $size: "$patients_uniques" }
          ]},
          100
        ]
      }
  }},
  { $project: { patients_uniques: 0 } },
  { $sort: { total_consultations: -1 } },
  { $limit: 5 }
]).toArray();

printjson(rapportMedecins);
