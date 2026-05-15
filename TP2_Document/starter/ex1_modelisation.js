/**
 * TP2 - Exercice 1 : Modélisation MongoDB
 * Use Case : HealthCare DZ - Dossiers Médicaux
 */

use("medical_db");

db.createCollection("patients", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["cin", "nom", "prenom", "dateNaissance", "sexe"],
      properties: {
        cin: { bsonType: "string", description: "CIN obligatoire, unique" },
        nom: { bsonType: "string", description: "Nom de famille obligatoire" },
        prenom: { bsonType: "string", description: "Prénom obligatoire" },
        dateNaissance: { bsonType: "date", description: "Date de naissance obligatoire" },
        sexe: { enum: ["M", "F"], description: "Sexe : M ou F" },
        groupeSanguin: { bsonType: "string" },
        adresse: {
          bsonType: "object",
          properties: {
            wilaya: { bsonType: "string" },
            commune: { bsonType: "string" }
          }
        },
        antecedents: { bsonType: "array", items: { bsonType: "string" } },
        allergies:   { bsonType: "array", items: { bsonType: "string" } },
        consultations: { bsonType: "array" }
      }
    }
  }
});

const patients = [
  {
    cin: "198001012300", nom: "Bensalem", prenom: "Ahmed",
    dateNaissance: new Date("1980-01-01"), sexe: "M",
    adresse: { wilaya: "Alger", commune: "Bab Ezzouar" },
    groupeSanguin: "O+", antecedents: ["Diabète type 2", "HTA"], allergies: ["Pénicilline"],
    consultations: [
      { date: new Date("2024-01-15"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "Hypertension artérielle", tension: { systolique: 145, diastolique: 92 },
        medicaments: [{ nom: "Amlodipine", dosage: "5mg", duree: "30 jours" }],
        notes: "Surveillance tensionnelle recommandée" },
      { date: new Date("2024-06-10"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "HTA contrôlée", tension: { systolique: 132, diastolique: 84 },
        medicaments: [{ nom: "Amlodipine", dosage: "5mg", duree: "30 jours" }],
        notes: "Bonne évolution" }
    ]
  },
  {
    cin: "199503154400", nom: "Ouali", prenom: "Fatima",
    dateNaissance: new Date("1995-03-15"), sexe: "F",
    adresse: { wilaya: "Oran", commune: "Bir El Djir" },
    groupeSanguin: "A+", antecedents: ["Asthme"], allergies: [],
    consultations: [
      { date: new Date("2024-02-20"), medecin: { nom: "Dr. Kaci", specialite: "Pneumologie" },
        diagnostic: "Asthme allergique", medicaments: [{ nom: "Ventoline", dosage: "100mcg", duree: "Selon besoin" }],
        notes: "Éviter les allergènes" },
      { date: new Date("2024-09-05"), medecin: { nom: "Dr. Kaci", specialite: "Pneumologie" },
        diagnostic: "Crise d'asthme légère", medicaments: [{ nom: "Ventoline", dosage: "100mcg", duree: "7 jours" }],
        notes: "Contrôle dans 3 semaines" }
    ]
  },
  {
    cin: "197812285500", nom: "Meziane", prenom: "Karim",
    dateNaissance: new Date("1978-12-28"), sexe: "M",
    adresse: { wilaya: "Constantine", commune: "El Khroub" },
    groupeSanguin: "B+", antecedents: ["Diabète type 2", "HTA", "Insuffisance rénale"], allergies: ["Aspirine"],
    consultations: [
      { date: new Date("2024-03-01"), medecin: { nom: "Dr. Bouzidi", specialite: "Néphrologie" },
        diagnostic: "Insuffisance rénale chronique stade 3",
        medicaments: [{ nom: "Metformine", dosage: "500mg", duree: "30 jours" }], notes: "Régime hyposodé" },
      { date: new Date("2024-07-18"), medecin: { nom: "Dr. Bouzidi", specialite: "Néphrologie" },
        diagnostic: "Stabilisation rénale", medicaments: [{ nom: "Metformine", dosage: "500mg", duree: "30 jours" }],
        notes: "Créatinine stable" }
    ]
  },
  {
    cin: "200010226600", nom: "Hamdi", prenom: "Yasmine",
    dateNaissance: new Date("2000-10-22"), sexe: "F",
    adresse: { wilaya: "Annaba", commune: "El Bouni" },
    groupeSanguin: "AB-", antecedents: [], allergies: ["Latex"],
    consultations: [
      { date: new Date("2024-04-11"), medecin: { nom: "Dr. Cherif", specialite: "Médecine générale" },
        diagnostic: "Rhinite allergique", medicaments: [{ nom: "Cetirizine", dosage: "10mg", duree: "15 jours" }],
        notes: "Éviter le latex" }
    ]
  },
  {
    cin: "196506307700", nom: "Sahraoui", prenom: "Mohamed",
    dateNaissance: new Date("1965-06-30"), sexe: "M",
    adresse: { wilaya: "Blida", commune: "Bougara" },
    groupeSanguin: "O-", antecedents: ["HTA", "Dyslipidémie"], allergies: [],
    consultations: [
      { date: new Date("2024-01-08"), medecin: { nom: "Dr. Ait Ali", specialite: "Cardiologie" },
        diagnostic: "Dyslipidémie mixte", medicaments: [{ nom: "Atorvastatine", dosage: "20mg", duree: "30 jours" }],
        notes: "Régime pauvre en graisses" },
      { date: new Date("2024-05-22"), medecin: { nom: "Dr. Ait Ali", specialite: "Cardiologie" },
        diagnostic: "HTA + Dyslipidémie", medicaments: [{ nom: "Atorvastatine", dosage: "40mg", duree: "30 jours" }],
        notes: "Augmentation de la dose" },
      { date: new Date("2024-11-14"), medecin: { nom: "Dr. Ait Ali", specialite: "Cardiologie" },
        diagnostic: "Bilan lipidique amélioré", medicaments: [{ nom: "Atorvastatine", dosage: "20mg", duree: "30 jours" }],
        notes: "Réduction dose possible" }
    ]
  },
  {
    cin: "199201188800", nom: "Boukhobza", prenom: "Rania",
    dateNaissance: new Date("1992-01-18"), sexe: "F",
    adresse: { wilaya: "Alger", commune: "Hydra" },
    groupeSanguin: "A-", antecedents: ["Hypothyroïdie"], allergies: [],
    consultations: [
      { date: new Date("2024-02-05"), medecin: { nom: "Dr. Bouhaddou", specialite: "Endocrinologie" },
        diagnostic: "Hypothyroïdie auto-immune", medicaments: [{ nom: "Levothyroxine", dosage: "75mcg", duree: "90 jours" }],
        notes: "TSH à contrôler dans 3 mois" },
      { date: new Date("2024-08-20"), medecin: { nom: "Dr. Bouhaddou", specialite: "Endocrinologie" },
        diagnostic: "Hypothyroïdie équilibrée", medicaments: [{ nom: "Levothyroxine", dosage: "75mcg", duree: "90 jours" }],
        notes: "TSH normale" }
    ]
  },
  {
    cin: "198807049900", nom: "Taleb", prenom: "Yacine",
    dateNaissance: new Date("1988-07-04"), sexe: "M",
    adresse: { wilaya: "Oran", commune: "Arzew" },
    groupeSanguin: "B-", antecedents: ["Diabète type 2"], allergies: ["Sulfamides"],
    consultations: [
      { date: new Date("2024-03-15"), medecin: { nom: "Dr. Hamdaoui", specialite: "Diabétologie" },
        diagnostic: "Diabète type 2 déséquilibré", medicaments: [{ nom: "Insuline glargine", dosage: "10UI", duree: "30 jours" }],
        notes: "HbA1c: 9.2%" },
      { date: new Date("2024-09-28"), medecin: { nom: "Dr. Hamdaoui", specialite: "Diabétologie" },
        diagnostic: "Meilleur contrôle glycémique", medicaments: [{ nom: "Insuline glargine", dosage: "14UI", duree: "30 jours" }],
        notes: "HbA1c: 7.8%" }
    ]
  },
  {
    cin: "197405211010", nom: "Belkacem", prenom: "Nadia",
    dateNaissance: new Date("1974-05-21"), sexe: "F",
    adresse: { wilaya: "Constantine", commune: "Hamma Bouziane" },
    groupeSanguin: "AB+", antecedents: ["HTA", "Diabète type 2"], allergies: [],
    consultations: [
      { date: new Date("2024-01-30"), medecin: { nom: "Dr. Amrani", specialite: "Médecine interne" },
        diagnostic: "HTA + Diabète type 2", medicaments: [
          { nom: "Metformine", dosage: "1g", duree: "30 jours" },
          { nom: "Ramipril", dosage: "5mg", duree: "30 jours" }
        ], notes: "Surveillance glycémique quotidienne" },
      { date: new Date("2024-07-02"), medecin: { nom: "Dr. Amrani", specialite: "Médecine interne" },
        diagnostic: "Équilibration partielle", medicaments: [
          { nom: "Metformine", dosage: "1g", duree: "30 jours" },
          { nom: "Ramipril", dosage: "10mg", duree: "30 jours" }
        ], notes: "Augmentation Ramipril" }
    ]
  },
  {
    cin: "200205141111", nom: "Messaoud", prenom: "Ines",
    dateNaissance: new Date("2002-05-14"), sexe: "F",
    adresse: { wilaya: "Alger", commune: "El Harrach" },
    groupeSanguin: "O+", antecedents: [], allergies: [],
    consultations: [
      { date: new Date("2024-06-01"), medecin: { nom: "Dr. Hadj", specialite: "Dermatologie" },
        diagnostic: "Acné sévère", medicaments: [{ nom: "Isotrétinoïne", dosage: "20mg", duree: "90 jours" }],
        notes: "Contraception obligatoire" }
    ]
  },
  {
    cin: "196911271212", nom: "Gherbi", prenom: "Omar",
    dateNaissance: new Date("1969-11-27"), sexe: "M",
    adresse: { wilaya: "Blida", commune: "Boufarik" },
    groupeSanguin: "A+", antecedents: ["Diabète type 2", "HTA", "Cardiopathie ischémique"], allergies: ["Pénicilline"],
    consultations: [
      { date: new Date("2024-02-14"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "Cardiopathie ischémique stable", medicaments: [
          { nom: "Aspirine", dosage: "100mg", duree: "Chronique" },
          { nom: "Bisoprolol", dosage: "5mg", duree: "Chronique" }
        ], notes: "ECG trimestriel" },
      { date: new Date("2024-08-08"), medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "Stable", medicaments: [
          { nom: "Aspirine", dosage: "100mg", duree: "Chronique" },
          { nom: "Bisoprolol", dosage: "5mg", duree: "Chronique" }
        ], notes: "ECG normal" }
    ]
  },
  {
    cin: "198302031313", nom: "Rahmani", prenom: "Sara",
    dateNaissance: new Date("1983-02-03"), sexe: "F",
    adresse: { wilaya: "Annaba", commune: "Seraidi" },
    groupeSanguin: "B+", antecedents: ["Lupus érythémateux"], allergies: ["AINS"],
    consultations: [
      { date: new Date("2024-04-22"), medecin: { nom: "Dr. Belouizdad", specialite: "Rhumatologie" },
        diagnostic: "Poussée lupique modérée", medicaments: [{ nom: "Hydroxychloroquine", dosage: "200mg", duree: "30 jours" }],
        notes: "Bilan rénal mensuel" }
    ]
  },
  {
    cin: "199709121414", nom: "Ziani", prenom: "Sofiane",
    dateNaissance: new Date("1997-09-12"), sexe: "M",
    adresse: { wilaya: "Oran", commune: "Es Senia" },
    groupeSanguin: "O+", antecedents: [], allergies: [],
    consultations: [
      { date: new Date("2024-05-17"), medecin: { nom: "Dr. Khalfi", specialite: "Orthopédie" },
        diagnostic: "Entorse cheville grade 2", medicaments: [{ nom: "Ibuprofène", dosage: "400mg", duree: "7 jours" }],
        notes: "Repos sportif 3 semaines" },
      { date: new Date("2024-06-10"), medecin: { nom: "Dr. Khalfi", specialite: "Orthopédie" },
        diagnostic: "Bonne récupération", medicaments: [], notes: "Reprise progressive" }
    ]
  },
  {
    cin: "196205081515", nom: "Benali", prenom: "Rachid",
    dateNaissance: new Date("1962-05-08"), sexe: "M",
    adresse: { wilaya: "Alger", commune: "Dar El Beida" },
    groupeSanguin: "AB+", antecedents: ["BPCO", "HTA"], allergies: [],
    consultations: [
      { date: new Date("2024-01-20"), medecin: { nom: "Dr. Kaci", specialite: "Pneumologie" },
        diagnostic: "Exacerbation BPCO", medicaments: [
          { nom: "Salbutamol", dosage: "2.5mg", duree: "10 jours" },
          { nom: "Prednisolone", dosage: "40mg", duree: "5 jours" }
        ], notes: "Arrêt tabac recommandé" },
      { date: new Date("2024-07-30"), medecin: { nom: "Dr. Kaci", specialite: "Pneumologie" },
        diagnostic: "BPCO stable", medicaments: [{ nom: "Tiotropium", dosage: "18mcg", duree: "30 jours" }],
        notes: "Spirométrie normale" }
    ]
  },
  {
    cin: "199406251616", nom: "Ferhat", prenom: "Amina",
    dateNaissance: new Date("1994-06-25"), sexe: "F",
    adresse: { wilaya: "Blida", commune: "Larbaa" },
    groupeSanguin: "A-", antecedents: ["Anémie ferriprive"], allergies: [],
    consultations: [
      { date: new Date("2024-03-08"), medecin: { nom: "Dr. Amrani", specialite: "Médecine interne" },
        diagnostic: "Anémie ferriprive sévère", medicaments: [{ nom: "Fer sulfate", dosage: "200mg", duree: "90 jours" }],
        notes: "NFS dans 3 mois" }
    ]
  },
  {
    cin: "197101171717", nom: "Touati", prenom: "Hamza",
    dateNaissance: new Date("1971-01-17"), sexe: "M",
    adresse: { wilaya: "Constantine", commune: "Ain Smara" },
    groupeSanguin: "O-", antecedents: ["Diabète type 2", "HTA", "Neuropathie"], allergies: ["Codéine"],
    consultations: [
      { date: new Date("2024-02-28"), medecin: { nom: "Dr. Bouzidi", specialite: "Neurologie" },
        diagnostic: "Neuropathie diabétique", medicaments: [{ nom: "Prégabaline", dosage: "75mg", duree: "30 jours" }],
        notes: "Contrôle glycémique strict" },
      { date: new Date("2024-08-15"), medecin: { nom: "Dr. Bouzidi", specialite: "Neurologie" },
        diagnostic: "Amélioration partielle douleurs", medicaments: [{ nom: "Prégabaline", dosage: "150mg", duree: "30 jours" }],
        notes: "Augmentation dose" }
    ]
  },
  {
    cin: "200108241818", nom: "Mabrouk", prenom: "Lina",
    dateNaissance: new Date("2001-08-24"), sexe: "F",
    adresse: { wilaya: "Annaba", commune: "El Hadjar" },
    groupeSanguin: "B+", antecedents: [], allergies: [],
    consultations: [
      { date: new Date("2024-09-10"), medecin: { nom: "Dr. Hadj", specialite: "Gynécologie" },
        diagnostic: "Dysménorrhée primaire", medicaments: [{ nom: "Ibuprofène", dosage: "400mg", duree: "5 jours" }],
        notes: "Contraceptifs oraux discutés" }
    ]
  },
  {
    cin: "196803221919", nom: "Brahim", prenom: "Farouk",
    dateNaissance: new Date("1968-03-22"), sexe: "M",
    adresse: { wilaya: "Alger", commune: "Hydra" },
    groupeSanguin: "A+", antecedents: ["HTA", "Hypertrophie bénigne prostate"], allergies: [],
    consultations: [
      { date: new Date("2024-04-05"), medecin: { nom: "Dr. Hadj", specialite: "Urologie" },
        diagnostic: "HBP grade 2", medicaments: [{ nom: "Tamsulosine", dosage: "0.4mg", duree: "30 jours" }],
        notes: "PSA à contrôler" },
      { date: new Date("2024-10-01"), medecin: { nom: "Dr. Hadj", specialite: "Urologie" },
        diagnostic: "HBP stable", medicaments: [{ nom: "Tamsulosine", dosage: "0.4mg", duree: "30 jours" }],
        notes: "PSA normal" }
    ]
  },
  {
    cin: "199011302020", nom: "Boukhalfa", prenom: "Meriem",
    dateNaissance: new Date("1990-11-30"), sexe: "F",
    adresse: { wilaya: "Oran", commune: "Bir El Djir" },
    groupeSanguin: "O+", antecedents: ["Polyarthrite rhumatoïde"], allergies: ["Méthotrexate"],
    consultations: [
      { date: new Date("2024-05-03"), medecin: { nom: "Dr. Belouizdad", specialite: "Rhumatologie" },
        diagnostic: "PR active modérée", medicaments: [{ nom: "Leflunomide", dosage: "20mg", duree: "30 jours" }],
        notes: "Bilan hépatique mensuel" }
    ]
  },
  {
    cin: "197507162121", nom: "Djaballah", prenom: "Khaled",
    dateNaissance: new Date("1975-07-16"), sexe: "M",
    adresse: { wilaya: "Blida", commune: "Bougara" },
    groupeSanguin: "AB-", antecedents: ["Diabète type 2", "HTA"], allergies: [],
    consultations: [
      { date: new Date("2024-06-20"), medecin: { nom: "Dr. Hamdaoui", specialite: "Diabétologie" },
        diagnostic: "Diabète équilibré sous traitement", medicaments: [{ nom: "Metformine", dosage: "850mg", duree: "30 jours" }],
        notes: "HbA1c: 6.9%, objectif atteint" },
      { date: new Date("2024-11-05"), medecin: { nom: "Dr. Hamdaoui", specialite: "Diabétologie" },
        diagnostic: "Poursuite traitement", medicaments: [{ nom: "Metformine", dosage: "850mg", duree: "30 jours" }],
        notes: "Bilan annuel prévu" }
    ]
  },
  {
    cin: "200309182222", nom: "Aissaoui", prenom: "Houssem",
    dateNaissance: new Date("2003-09-18"), sexe: "M",
    adresse: { wilaya: "Constantine", commune: "El Khroub" },
    groupeSanguin: "B-", antecedents: [], allergies: [],
    consultations: [
      { date: new Date("2024-07-14"), medecin: { nom: "Dr. Cherif", specialite: "Médecine générale" },
        diagnostic: "Angine streptococcique", medicaments: [{ nom: "Amoxicilline", dosage: "1g", duree: "7 jours" }],
        notes: "Contrôle si fièvre persistante" },
      { date: new Date("2024-08-02"), medecin: { nom: "Dr. Cherif", specialite: "Médecine générale" },
        diagnostic: "Guérison complète", medicaments: [], notes: "RAS" }
    ]
  }
];

db.patients.insertMany(patients);

const p1 = db.patients.findOne({ cin: "198001012300" })._id;
const p2 = db.patients.findOne({ cin: "199503154400" })._id;
const p3 = db.patients.findOne({ cin: "197812285500" })._id;
const p7 = db.patients.findOne({ cin: "198807049900" })._id;

const analyses = [
  { patient_id: p1, type: "Glycémie", date: new Date("2024-01-15"), valeur: 8.2, unite: "mmol/L", normal: false, laboratoire: "Labo Central Alger" },
  { patient_id: p1, type: "Lipidogramme", date: new Date("2024-01-15"), valeur: { LDL: 4.1, HDL: 1.0, TG: 2.3 }, normal: false, laboratoire: "Labo Central Alger" },
  { patient_id: p2, type: "NFS", date: new Date("2024-02-20"), valeur: { GB: 7.2, GR: 4.5, Hb: 12.8, Plt: 245 }, normal: true, laboratoire: "Bio Oran" },
  { patient_id: p3, type: "Créatinine", date: new Date("2024-03-01"), valeur: 185, unite: "µmol/L", normal: false, laboratoire: "Labo Constantine" },
  { patient_id: p3, type: "Glycémie", date: new Date("2024-03-01"), valeur: 9.1, unite: "mmol/L", normal: false, laboratoire: "Labo Constantine" },
  { patient_id: p7, type: "HbA1c", date: new Date("2024-03-15"), valeur: 9.2, unite: "%", normal: false, laboratoire: "Bio Oran" },
  { patient_id: p7, type: "HbA1c", date: new Date("2024-09-28"), valeur: 7.8, unite: "%", normal: false, laboratoire: "Bio Oran" },
  { patient_id: p1, type: "ECG", date: new Date("2024-06-10"), resultat: "Rythme sinusal normal, pas d'anomalie", normal: true, laboratoire: "Clinique El Azhar" },
];

db.analyses.insertMany(analyses);

print(" Modélisation terminée. Patients insérés:", db.patients.countDocuments());
print(" Analyses insérées:", db.analyses.countDocuments());
