// TP4 - Exercice 1 : Création du graphe UniConnect DZ
// Effacer la base pour partir propre
MATCH (n) DETACH DELETE n;

// ─── 1.1 : Contraintes d'unicité ─────────────────────────────────────────────
CREATE CONSTRAINT etudiant_id IF NOT EXISTS FOR (e:Etudiant) REQUIRE e.id IS UNIQUE;
CREATE CONSTRAINT cours_code IF NOT EXISTS FOR (c:Cours) REQUIRE c.code IS UNIQUE;
CREATE CONSTRAINT competence_nom IF NOT EXISTS FOR (c:Competence) REQUIRE c.nom IS UNIQUE;

// ─── 1.2 : Créer les compétences ──────────────────────────────────────────────
UNWIND [
  {nom: "Python", categorie: "Programmation"},
  {nom: "Java", categorie: "Programmation"},
  {nom: "SQL", categorie: "Bases de Données"},
  {nom: "NoSQL", categorie: "Bases de Données"},
  {nom: "Machine Learning", categorie: "IA"},
  {nom: "Deep Learning", categorie: "IA"},
  {nom: "React", categorie: "Web"},
  {nom: "Docker", categorie: "DevOps"},
  {nom: "Linux", categorie: "Systèmes"},
  {nom: "Réseaux", categorie: "Infrastructure"}
] AS comp
MERGE (:Competence {nom: comp.nom, categorie: comp.categorie});

// ─── 1.3 : Créer les cours ────────────────────────────────────────────────────
UNWIND [
  {code: "INFO401", intitule: "Bases de Données Avancées", credits: 6, dept: "Informatique"},
  {code: "INFO402", intitule: "Intelligence Artificielle", credits: 6, dept: "Informatique"},
  {code: "INFO403", intitule: "Développement Web", credits: 4, dept: "Informatique"},
  {code: "INFO404", intitule: "Systèmes Distribués", credits: 5, dept: "Informatique"},
  {code: "INFO405", intitule: "Cloud Computing", credits: 4, dept: "Informatique"}
] AS cours
MERGE (:Cours {code: cours.code, intitule: cours.intitule,
               credits: cours.credits, departement: cours.dept});

// ─── 1.4 : Créer 50 étudiants avec données algériennes ────────────────────────
UNWIND [
  {id:"E001", prenom:"Ahmed",    nom:"Bensalem",    universite:"USTHB", filiere:"Informatique",    annee:3, ville:"Alger"},
  {id:"E002", prenom:"Fatima",   nom:"Ouali",        universite:"USTHB", filiere:"Informatique",    annee:3, ville:"Alger"},
  {id:"E003", prenom:"Karim",    nom:"Meziane",      universite:"UMBB",  filiere:"GL",              annee:2, ville:"Boumerdes"},
  {id:"E004", prenom:"Yasmine",  nom:"Hamdi",        universite:"USTO",  filiere:"Informatique",    annee:4, ville:"Oran"},
  {id:"E005", prenom:"Rania",    nom:"Boukhobza",    universite:"UMC",   filiere:"Mathématiques",   annee:1, ville:"Constantine"},
  {id:"E006", prenom:"Yacine",   nom:"Taleb",        universite:"UBMA",  filiere:"Electronique",    annee:3, ville:"Annaba"},
  {id:"E007", prenom:"Nadia",    nom:"Belkacem",     universite:"USTHB", filiere:"Telecoms",        annee:2, ville:"Alger"},
  {id:"E008", prenom:"Sofiane",  nom:"Ziani",        universite:"USTO",  filiere:"GL",              annee:4, ville:"Oran"},
  {id:"E009", prenom:"Sara",     nom:"Rahmani",      universite:"UMBB",  filiere:"Informatique",    annee:3, ville:"Boumerdes"},
  {id:"E010", prenom:"Omar",     nom:"Gherbi",       universite:"UMC",   filiere:"Informatique",    annee:2, ville:"Constantine"},
  {id:"E011", prenom:"Amina",    nom:"Ferhat",       universite:"USTHB", filiere:"GL",              annee:1, ville:"Alger"},
  {id:"E012", prenom:"Hamza",    nom:"Touati",       universite:"UBMA",  filiere:"Electronique",    annee:4, ville:"Annaba"},
  {id:"E013", prenom:"Meriem",   nom:"Boukhalfa",    universite:"USTO",  filiere:"Informatique",    annee:3, ville:"Oran"},
  {id:"E014", prenom:"Khaled",   nom:"Djaballah",    universite:"UMC",   filiere:"Mathématiques",   annee:2, ville:"Constantine"},
  {id:"E015", prenom:"Houssem",  nom:"Aissaoui",     universite:"USTHB", filiere:"Telecoms",        annee:3, ville:"Alger"},
  {id:"E016", prenom:"Imane",    nom:"Lakhdar",      universite:"UMBB",  filiere:"GL",              annee:4, ville:"Boumerdes"},
  {id:"E017", prenom:"Bilal",    nom:"Chergui",      universite:"USTO",  filiere:"Informatique",    annee:1, ville:"Oran"},
  {id:"E018", prenom:"Sabrina",  nom:"Hadjadj",      universite:"UBMA",  filiere:"Informatique",    annee:2, ville:"Annaba"},
  {id:"E019", prenom:"Wassim",   nom:"Oukaci",       universite:"UMC",   filiere:"Electronique",    annee:3, ville:"Constantine"},
  {id:"E020", prenom:"Lynda",    nom:"Saidi",        universite:"USTHB", filiere:"Informatique",    annee:4, ville:"Alger"},
  {id:"E021", prenom:"Adel",     nom:"Brahimi",      universite:"UMBB",  filiere:"GL",              annee:2, ville:"Boumerdes"},
  {id:"E022", prenom:"Chaima",   nom:"Bouchenak",    universite:"USTO",  filiere:"Mathématiques",   annee:1, ville:"Oran"},
  {id:"E023", prenom:"Riad",     nom:"Benhamida",    universite:"UBMA",  filiere:"Telecoms",        annee:3, ville:"Annaba"},
  {id:"E024", prenom:"Nour",     nom:"Tlemsani",     universite:"UMC",   filiere:"Informatique",    annee:4, ville:"Constantine"},
  {id:"E025", prenom:"Zakariya", nom:"Dali",         universite:"USTHB", filiere:"Electronique",    annee:2, ville:"Alger"},
  {id:"E026", prenom:"Hanane",   nom:"Mokrani",      universite:"UMBB",  filiere:"Informatique",    annee:3, ville:"Boumerdes"},
  {id:"E027", prenom:"Amine",    nom:"Lounis",       universite:"USTO",  filiere:"GL",              annee:4, ville:"Oran"},
  {id:"E028", prenom:"Sonia",    nom:"Benaceur",     universite:"UBMA",  filiere:"Informatique",    annee:1, ville:"Annaba"},
  {id:"E029", prenom:"Nassim",   nom:"Guerfi",       universite:"UMC",   filiere:"Mathématiques",   annee:2, ville:"Constantine"},
  {id:"E030", prenom:"Malak",    nom:"Rezzoug",      universite:"USTHB", filiere:"Telecoms",        annee:3, ville:"Alger"},
  {id:"E031", prenom:"Ryad",     nom:"Kellil",       universite:"UMBB",  filiere:"Informatique",    annee:4, ville:"Boumerdes"},
  {id:"E032", prenom:"Asma",     nom:"Benahmed",     universite:"USTO",  filiere:"Electronique",    annee:2, ville:"Oran"},
  {id:"E033", prenom:"Lotfi",    nom:"Hammami",      universite:"UBMA",  filiere:"GL",              annee:1, ville:"Annaba"},
  {id:"E034", prenom:"Widad",    nom:"Athmani",      universite:"UMC",   filiere:"Informatique",    annee:3, ville:"Constantine"},
  {id:"E035", prenom:"Ilyes",    nom:"Hadjali",      universite:"USTHB", filiere:"Informatique",    annee:4, ville:"Alger"},
  {id:"E036", prenom:"Djamila",  nom:"Benmansour",   universite:"UMBB",  filiere:"Mathématiques",   annee:2, ville:"Boumerdes"},
  {id:"E037", prenom:"Tarek",    nom:"Khelifi",      universite:"USTO",  filiere:"Telecoms",        annee:3, ville:"Oran"},
  {id:"E038", prenom:"Souad",    nom:"Ferroukhi",    universite:"UBMA",  filiere:"Informatique",    annee:1, ville:"Annaba"},
  {id:"E039", prenom:"Mourad",   nom:"Bensaid",      universite:"UMC",   filiere:"GL",              annee:4, ville:"Constantine"},
  {id:"E040", prenom:"Amel",     nom:"Ghilas",       universite:"USTHB", filiere:"Electronique",    annee:2, ville:"Alger"},
  {id:"E041", prenom:"Raouf",    nom:"Madani",       universite:"UMBB",  filiere:"Informatique",    annee:3, ville:"Boumerdes"},
  {id:"E042", prenom:"Naouel",   nom:"Cherif",       universite:"USTO",  filiere:"Informatique",    annee:4, ville:"Oran"},
  {id:"E043", prenom:"Hocine",   nom:"Meddour",      universite:"UBMA",  filiere:"GL",              annee:1, ville:"Annaba"},
  {id:"E044", prenom:"Farah",    nom:"Boussaid",     universite:"UMC",   filiere:"Mathématiques",   annee:2, ville:"Constantine"},
  {id:"E045", prenom:"Salim",    nom:"Benabdallah",  universite:"USTHB", filiere:"Telecoms",        annee:3, ville:"Alger"},
  {id:"E046", prenom:"Karima",   nom:"Mebarki",      universite:"UMBB",  filiere:"Informatique",    annee:4, ville:"Boumerdes"},
  {id:"E047", prenom:"Nadir",    nom:"Boughazi",     universite:"USTO",  filiere:"Electronique",    annee:2, ville:"Oran"},
  {id:"E048", prenom:"Siham",    nom:"Zerrouki",     universite:"UBMA",  filiere:"Informatique",    annee:1, ville:"Annaba"},
  {id:"E049", prenom:"Fares",    nom:"Hadjoudj",     universite:"UMC",   filiere:"GL",              annee:3, ville:"Constantine"},
  {id:"E050", prenom:"Zineb",    nom:"Bouabdallah",  universite:"USTHB", filiere:"Informatique",    annee:4, ville:"Alger"}
] AS data
MERGE (e:Etudiant {id: data.id})
SET e += data;

// ─── 1.5 : Relations CONNAIT entre étudiants ──────────────────────────────────
// Graphe connexe : chaîne principale + connexions inter-universités

UNWIND [
  ["E001","E002"], ["E001","E007"], ["E001","E011"], ["E001","E015"], ["E001","E020"],
  ["E002","E003"], ["E002","E009"], ["E002","E016"], ["E003","E004"], ["E003","E021"],
  ["E004","E005"], ["E004","E008"], ["E004","E013"], ["E005","E006"], ["E005","E014"],
  ["E006","E007"], ["E006","E012"], ["E006","E023"], ["E007","E008"], ["E007","E025"],
  ["E008","E009"], ["E008","E027"], ["E009","E010"], ["E009","E026"], ["E010","E011"],
  ["E010","E029"], ["E011","E012"], ["E011","E030"], ["E012","E013"], ["E013","E014"],
  ["E013","E042"], ["E014","E015"], ["E015","E016"], ["E016","E017"], ["E017","E018"],
  ["E018","E019"], ["E018","E038"], ["E019","E020"], ["E019","E034"], ["E020","E021"],
  ["E021","E022"], ["E022","E023"], ["E023","E024"], ["E024","E025"], ["E025","E026"],
  ["E026","E027"], ["E027","E028"], ["E028","E029"], ["E029","E030"], ["E030","E031"],
  ["E031","E032"], ["E032","E033"], ["E033","E034"], ["E034","E035"], ["E035","E036"],
  ["E036","E037"], ["E037","E038"], ["E038","E039"], ["E039","E040"], ["E040","E041"],
  ["E041","E042"], ["E042","E043"], ["E043","E044"], ["E044","E045"], ["E045","E046"],
  ["E046","E047"], ["E047","E048"], ["E048","E049"], ["E049","E050"], ["E050","E001"],
  ["E001","E035"], ["E010","E040"], ["E020","E030"], ["E005","E045"], ["E015","E025"]
] AS pair
MATCH (a:Etudiant {id: pair[0]}), (b:Etudiant {id: pair[1]})
MERGE (a)-[:CONNAIT]-(b);

// ─── Relations SUIT (étudiant → cours) avec notes ─────────────────────────────
UNWIND [
  {eid:"E001", code:"INFO401", note:16.5}, {eid:"E001", code:"INFO402", note:14.0},
  {eid:"E002", code:"INFO401", note:18.0}, {eid:"E002", code:"INFO403", note:15.5},
  {eid:"E003", code:"INFO403", note:13.0}, {eid:"E003", code:"INFO404", note:11.5},
  {eid:"E004", code:"INFO401", note:17.0}, {eid:"E004", code:"INFO402", note:16.0},
  {eid:"E005", code:"INFO401", note:12.5}, {eid:"E005", code:"INFO405", note:14.0},
  {eid:"E006", code:"INFO404", note:15.0}, {eid:"E006", code:"INFO405", note:13.5},
  {eid:"E007", code:"INFO401", note:14.5}, {eid:"E007", code:"INFO402", note:13.0},
  {eid:"E008", code:"INFO403", note:16.0}, {eid:"E008", code:"INFO404", note:17.5},
  {eid:"E009", code:"INFO401", note:15.0}, {eid:"E009", code:"INFO403", note:14.0},
  {eid:"E010", code:"INFO402", note:12.0}, {eid:"E010", code:"INFO405", note:11.0},
  {eid:"E011", code:"INFO401", note:19.0}, {eid:"E011", code:"INFO402", note:18.5},
  {eid:"E012", code:"INFO404", note:16.5}, {eid:"E013", code:"INFO403", note:15.0},
  {eid:"E014", code:"INFO401", note:13.5}, {eid:"E015", code:"INFO402", note:14.5},
  {eid:"E020", code:"INFO401", note:17.5}, {eid:"E020", code:"INFO404", note:16.0},
  {eid:"E035", code:"INFO401", note:15.5}, {eid:"E035", code:"INFO402", note:16.5},
  {eid:"E050", code:"INFO401", note:14.0}, {eid:"E050", code:"INFO405", note:15.0}
] AS rel
MATCH (e:Etudiant {id: rel.eid}), (c:Cours {code: rel.code})
MERGE (e)-[:SUIT {note: rel.note, annee_academique: "2023-2024"}]->(c);

// ─── Relations MAITRISE (étudiant → compétence) ────────────────────────────────
UNWIND [
  {eid:"E001", comp:"Python",         niveau:4}, {eid:"E001", comp:"SQL",            niveau:5},
  {eid:"E001", comp:"NoSQL",          niveau:3}, {eid:"E002", comp:"Python",         niveau:5},
  {eid:"E002", comp:"Machine Learning", niveau:4}, {eid:"E003", comp:"Java",         niveau:4},
  {eid:"E003", comp:"React",          niveau:3}, {eid:"E004", comp:"Python",         niveau:5},
  {eid:"E004", comp:"Machine Learning", niveau:5}, {eid:"E004", comp:"Deep Learning", niveau:4},
  {eid:"E005", comp:"SQL",            niveau:4}, {eid:"E005", comp:"Python",         niveau:3},
  {eid:"E006", comp:"Linux",          niveau:4}, {eid:"E006", comp:"Réseaux",        niveau:5},
  {eid:"E007", comp:"Réseaux",        niveau:4}, {eid:"E007", comp:"Docker",         niveau:3},
  {eid:"E008", comp:"React",          niveau:5}, {eid:"E008", comp:"Java",           niveau:4},
  {eid:"E009", comp:"Python",         niveau:4}, {eid:"E009", comp:"SQL",            niveau:3},
  {eid:"E010", comp:"Machine Learning", niveau:3}, {eid:"E011", comp:"Python",       niveau:5},
  {eid:"E011", comp:"NoSQL",          niveau:5}, {eid:"E011", comp:"SQL",            niveau:5},
  {eid:"E012", comp:"Linux",          niveau:5}, {eid:"E012", comp:"Docker",         niveau:4},
  {eid:"E020", comp:"Python",         niveau:4}, {eid:"E020", comp:"Docker",         niveau:4},
  {eid:"E035", comp:"SQL",            niveau:4}, {eid:"E035", comp:"NoSQL",          niveau:4},
  {eid:"E050", comp:"Python",         niveau:3}, {eid:"E050", comp:"React",          niveau:4}
] AS rel
MATCH (e:Etudiant {id: rel.eid}), (c:Competence {nom: rel.comp})
MERGE (e)-[:MAITRISE {niveau: rel.niveau}]->(c);

// ─── Prérequis entre cours et compétences ────────────────────────────────────
MATCH (c1:Cours {code:"INFO401"}), (comp:Competence {nom:"SQL"})
MERGE (c1)-[:REQUIERT]->(comp);
MATCH (c2:Cours {code:"INFO402"}), (comp:Competence {nom:"Machine Learning"})
MERGE (c2)-[:REQUIERT]->(comp);
MATCH (c2:Cours {code:"INFO402"}), (comp:Competence {nom:"Python"})
MERGE (c2)-[:REQUIERT]->(comp);
MATCH (c3:Cours {code:"INFO403"}), (comp:Competence {nom:"React"})
MERGE (c3)-[:REQUIERT]->(comp);
MATCH (c4:Cours {code:"INFO404"}), (comp:Competence {nom:"Docker"})
MERGE (c4)-[:REQUIERT]->(comp);
MATCH (c4:Cours {code:"INFO404"}), (comp:Competence {nom:"Linux"})
MERGE (c4)-[:REQUIERT]->(comp);
MATCH (c5:Cours {code:"INFO405"}), (comp:Competence {nom:"Docker"})
MERGE (c5)-[:REQUIERT]->(comp);

// Vérification finale
MATCH (n) RETURN labels(n)[0] AS type, count(n) AS total ORDER BY total DESC;
MATCH ()-[r]->() RETURN type(r) AS relation, count(r) AS total ORDER BY total DESC;
