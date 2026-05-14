"""
TP3 - Exercice 2 : Ingestion de données IoT
Use Case : SmartGrid DZ - 10 000 capteurs, 5 minutes de mesures
"""
from cassandra.cluster import Cluster
from cassandra.query import BatchStatement, BatchType
import uuid
import random
from datetime import datetime, timedelta
import time

# Configuration
CASSANDRA_HOST = 'localhost'
KEYSPACE = 'smartgrid'
NB_CAPTEURS = 10000
MINUTES_HISTORIQUE = 5

WILAYAS = ["Alger", "Oran", "Constantine", "Annaba", "Blida"]
COMMUNES = {
    "Alger": ["Bab Ezzouar", "Hydra", "El Harrach", "Dar El Beida"],
    "Oran": ["Bir El Djir", "Es Senia", "Arzew"],
    "Constantine": ["El Khroub", "Ain Smara", "Hamma Bouziane"],
    "Annaba": ["El Bouni", "El Hadjar", "Seraidi"],
    "Blida": ["Bougara", "Boufarik", "Larbaa"],
}

BATCH_SIZE = 50  # Bonne pratique Cassandra : batches de 50 max


def connect():
    """Connexion au cluster Cassandra"""
    cluster = Cluster([CASSANDRA_HOST])
    session = cluster.connect(KEYSPACE)
    return session, cluster


def generate_mesure(capteur_id, wilaya, commune, timestamp):
    """Générer une mesure réaliste pour un capteur"""
    tension_base = 220  # Volts (réseau algérien)
    alerte = random.random() < 0.05
    code_alerte = None
    if alerte:
        code_alerte = random.choice(["SURTENSION", "SOUS_TENSION", "SURCHARGE", "TEMPERATURE_ELEVEE"])

    return {
        "capteur_id": capteur_id,
        "date_jour": timestamp.date(),
        "timestamp": timestamp,
        "wilaya": wilaya,
        "commune": commune,
        "tension_v": round(tension_base + random.gauss(0, 5), 2),
        "courant_a": round(random.uniform(0.5, 15.0), 2),
        "puissance_kw": round(random.uniform(0.1, 3.3), 3),
        "frequence_hz": round(50 + random.gauss(0, 0.1), 2),
        "temperature": round(random.uniform(20, 65), 1),
        "alerte": alerte,
        "code_alerte": code_alerte,
    }


def insert_single(session, mesure):
    """
    Insérer une seule mesure dans mesures_par_capteur via prepared statement.
    """
    prepared = session.prepare("""
        INSERT INTO mesures_par_capteur
          (capteur_id, date_jour, timestamp, wilaya, commune,
           tension_v, courant_a, puissance_kw, frequence_hz, temperature,
           alerte, code_alerte)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """)
    session.execute(prepared, (
        mesure["capteur_id"], mesure["date_jour"], mesure["timestamp"],
        mesure["wilaya"], mesure["commune"],
        mesure["tension_v"], mesure["courant_a"], mesure["puissance_kw"],
        mesure["frequence_hz"], mesure["temperature"],
        mesure["alerte"], mesure["code_alerte"]
    ))


def insert_batch(session, mesures: list):
    """
    Insérer un batch de mesures via UNLOGGED BATCH (optimal pour séries temporelles).
    Batches de max 50 items pour éviter les timeouts et la pression mémoire.
    """
    prepared = session.prepare("""
        INSERT INTO mesures_par_capteur
          (capteur_id, date_jour, timestamp, wilaya, commune,
           tension_v, courant_a, puissance_kw, frequence_hz, temperature,
           alerte, code_alerte)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """)

    # Découper en sous-batches de BATCH_SIZE
    for i in range(0, len(mesures), BATCH_SIZE):
        chunk = mesures[i:i + BATCH_SIZE]
        batch = BatchStatement(batch_type=BatchType.UNLOGGED)
        for m in chunk:
            batch.add(prepared, (
                m["capteur_id"], m["date_jour"], m["timestamp"],
                m["wilaya"], m["commune"],
                m["tension_v"], m["courant_a"], m["puissance_kw"],
                m["frequence_hz"], m["temperature"],
                m["alerte"], m["code_alerte"]
            ))
        session.execute(batch)


def run_ingestion(session):
    """
    Générer et insérer NB_CAPTEURS × MINUTES_HISTORIQUE mesures.
    """
    print(f"Démarrage ingestion : {NB_CAPTEURS} capteurs × {MINUTES_HISTORIQUE} min")
    start = time.time()

    # 1. Générer les capteurs avec leur localisation fixe
    capteurs = []
    for _ in range(NB_CAPTEURS):
        wilaya = random.choice(WILAYAS)
        commune = random.choice(COMMUNES[wilaya])
        capteurs.append({
            "id": uuid.uuid4(),
            "wilaya": wilaya,
            "commune": commune
        })

    # 2. Pour chaque minute des MINUTES_HISTORIQUE dernières minutes
    now = datetime.utcnow()
    total_inseres = 0

    for minute_offset in range(MINUTES_HISTORIQUE):
        ts = now - timedelta(minutes=minute_offset)
        mesures = [
            generate_mesure(c["id"], c["wilaya"], c["commune"], ts)
            for c in capteurs
        ]
        insert_batch(session, mesures)
        total_inseres += len(mesures)

        if (minute_offset + 1) % 1 == 0:
            print(f"  Minute {minute_offset + 1}/{MINUTES_HISTORIQUE} — "
                  f"{total_inseres:,} mesures insérées")

    elapsed = time.time() - start
    total = NB_CAPTEURS * MINUTES_HISTORIQUE
    print(f"\n✅ {total:,} mesures insérées en {elapsed:.1f}s")
    print(f"   Débit : {total/elapsed:,.0f} mesures/seconde")


if __name__ == "__main__":
    session, cluster = connect()
    run_ingestion(session)
    cluster.shutdown()
