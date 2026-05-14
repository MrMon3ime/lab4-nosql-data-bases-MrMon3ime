# RAPPORT TP2 — MongoDB : Plateforme Médicale HealthCare DZ

## 1. Modélisation choisie

### Approche : Embedding des consultations dans le document patient

**Justification** :
- Une consultation n'existe pas sans patient (relation de composition)
- Les requêtes lisent toujours les consultations avec le patient → évite les jointures
- Taille raisonnable : ~5 consultations/patient × ~300 bytes = < 2KB par document

**Séparation des analyses** (collection référencée) :
- Les analyses peuvent être nombreuses et volumineuses
- Accès souvent indépendant du dossier complet
- Permet un index TTL propre sur la collection analyses

### Schema du document patient
```json
{
  "cin": "string (unique)",
  "nom": "string",
  "prenom": "string",
  "dateNaissance": "Date",
  "sexe": "M|F",
  "adresse": { "wilaya": "string", "commune": "string" },
  "groupeSanguin": "string",
  "antecedents": ["string"],
  "allergies": ["string"],
  "consultations": [{
    "date": "Date",
    "medecin": { "nom": "string", "specialite": "string" },
    "diagnostic": "string",
    "medicaments": [{ "nom": "string", "dosage": "string", "duree": "string" }],
    "notes": "string"
  }]
}
```

## 2. Pipelines d'agrégation

### 3.1 — Diagnostics par wilaya
Étapes : `$unwind consultations` → `$group (wilaya + diagnostic)` → `$sort` → `$limit`

### 3.2 — Top médicament par spécialité
Double `$unwind` (consultations puis medicaments), `$group` par spécialité+médicament, second `$group` pour garder le top 1 avec `$first`.

### 3.3 — Évolution mensuelle
`$unwind` → `$match` (12 derniers mois) → `$group (année + mois)` → `$sort` → `$project` format "YYYY-MM"

### 3.4 — Patients à risque
`$match` avec `$all` sur antecedents + filtre âge > 60 via `$expr/$lt` sur dateNaissance. `$addFields` pour calculer l'âge en années.

### 3.5 — Rapport médecins
`$group` avec `$addToSet` pour les patients uniques, calcul du taux de ré-consultation = (total - uniques) / uniques × 100.

## 3. Index et optimisation

| Index | Champ(s) | Type | Usage |
|---|---|---|---|
| `idx_wilaya_antecedents` | `adresse.wilaya`, `antecedents` | Composé | Filtrage géo + pathologie |
| `idx_consultation_date` | `consultations.date` DESC | Simple | Tri chronologique |
| `idx_text_diagnostic` | `consultations.diagnostic`, `notes` | Text | Recherche full-text |
| `idx_analyses_patient` | `patient_id`, `date` | Composé | $lookup efficace |
| `idx_cin_unique` | `cin` | Unique | Contrainte d'intégrité |
| `idx_ttl_analyses_5ans` | `date` | TTL | Archivage automatique (5 ans) |

### Impact des index (explain())
- **Avant** : COLLSCAN → examine tous les documents
- **Après** : IXSCAN → examine uniquement les documents matchant l'index
- Gain typique : ×10 à ×100 sur les grandes collections

## 4. Validation du schéma ($jsonSchema)

Champs obligatoires : `cin`, `nom`, `prenom`, `dateNaissance`, `sexe`. Le validator bloque les insertions malformées au niveau de la collection (intégrité côté base).

## 5. Conclusion

MongoDB est idéal pour les dossiers médicaux : schéma flexible pour les différents types de consultations, embedding naturel des données liées, agrégations puissantes pour les statistiques, et index TTL pour la conformité RGPD/réglementaire.
