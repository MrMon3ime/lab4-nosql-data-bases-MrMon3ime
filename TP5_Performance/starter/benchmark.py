"""
TP5 - Benchmark Comparatif NoSQL
Mesurer les performances de Redis, MongoDB, Cassandra, Neo4j
"""
import time
import statistics
import json
import uuid
import random
import threading
from typing import Callable, List

import redis
from pymongo import MongoClient, InsertOne
from cassandra.cluster import Cluster
from cassandra.query import BatchStatement, BatchType
from neo4j import GraphDatabase


def measure_latency(fn: Callable, iterations: int = 1000) -> dict:
    """Exécuter fn iterations fois et retourner les statistiques."""
    latencies = []
    for _ in range(iterations):
        start = time.perf_counter()
        fn()
        latencies.append((time.perf_counter() - start) * 1000)

    latencies.sort()
    return {
        "mean_ms":       statistics.mean(latencies),
        "p50_ms":        latencies[int(0.50 * len(latencies))],
        "p95_ms":        latencies[int(0.95 * len(latencies))],
        "p99_ms":        latencies[int(0.99 * len(latencies))],
        "max_ms":        max(latencies),
        "throughput_rps": 1000 / statistics.mean(latencies)
    }


def print_results(name: str, results: dict):
    print(f"\n{'='*50}")
    print(f" {name}")
    print(f"{'='*50}")
    for k, v in results.items():
        print(f"  {k:20s}: {v:.2f}")



def benchmark_write_redis(n: int = 100_000):
    """Insérer n enregistrements dans Redis via pipeline pour maximiser le débit."""
    r = redis.Redis(host='localhost', port=6379)
    r.flushdb()

    start = time.time()
    pipe = r.pipeline(transaction=False)
    for i in range(n):
        key = f"bench:product:{i}"
        pipe.hset(key, mapping={
            "id": i,
            "name": f"Product {i}",
            "price": random.randint(100, 100000),
            "stock": random.randint(0, 500)
        })
        if (i + 1) % 1000 == 0:
            pipe.execute()
            pipe = r.pipeline(transaction=False)
    pipe.execute()

    elapsed = time.time() - start
    throughput = n / elapsed
    print(f"\n Redis Write — {n:,} records en {elapsed:.2f}s → {throughput:,.0f} ops/s")
    return throughput


def benchmark_write_mongodb(n: int = 100_000):
    """Insérer n documents dans MongoDB via bulk_write pour maximiser le débit."""
    client = MongoClient("mongodb://admin:admin123@localhost:27017/")
    db = client["benchmark"]
    db.products.drop()

    start = time.time()
    batch_size = 1000
    for i in range(0, n, batch_size):
        ops = [
            InsertOne({
                "_id": i + j,
                "name": f"Product {i+j}",
                "price": random.randint(100, 100000),
                "category": random.choice(["phones", "laptops", "audio", "accessories"]),
                "stock": random.randint(0, 500),
                "created_at": time.time()
            })
            for j in range(min(batch_size, n - i))
        ]
        db.products.bulk_write(ops, ordered=False)

    elapsed = time.time() - start
    throughput = n / elapsed
    print(f" MongoDB Write — {n:,} records en {elapsed:.2f}s → {throughput:,.0f} ops/s")
    client.close()
    return throughput


def benchmark_write_cassandra(n: int = 100_000):
    """Insérer n rows dans Cassandra via UNLOGGED BATCH."""
    cluster = Cluster(['localhost'])
    session = cluster.connect()

    session.execute("CREATE KEYSPACE IF NOT EXISTS benchmark WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}")
    session.set_keyspace("benchmark")
    session.execute("DROP TABLE IF EXISTS products")
    session.execute("""
        CREATE TABLE products (
          id UUID PRIMARY KEY,
          name TEXT,
          price INT,
          stock INT
        )
    """)

    prepared = session.prepare(
        "INSERT INTO products (id, name, price, stock) VALUES (?, ?, ?, ?)"
    )

    start = time.time()
    batch_size = 50
    items = [(uuid.uuid4(), f"Product {i}", random.randint(100, 100000), random.randint(0, 500)) for i in range(n)]

    for i in range(0, n, batch_size):
        chunk = items[i:i + batch_size]
        batch = BatchStatement(batch_type=BatchType.UNLOGGED)
        for row in chunk:
            batch.add(prepared, row)
        session.execute(batch)

    elapsed = time.time() - start
    throughput = n / elapsed
    print(f" Cassandra Write — {n:,} records en {elapsed:.2f}s → {throughput:,.0f} ops/s")
    cluster.shutdown()
    return throughput



def benchmark_read_redis():
    """Point lookup, range (ZRANGE), complex (pipeline multi-get)."""
    r = redis.Redis(host='localhost', port=6379, decode_responses=True)

    def point_lookup():
        r.hgetall(f"bench:product:{random.randint(0, 99999)}")

    res_point = measure_latency(point_lookup, 1000)
    print_results("Redis — Point Lookup (HGETALL)", res_point)

    def multi_get():
        pipe = r.pipeline()
        for _ in range(10):
            pipe.hgetall(f"bench:product:{random.randint(0, 99999)}")
        pipe.execute()

    res_multi = measure_latency(multi_get, 500)
    print_results("Redis — Multi-Get Pipeline (10 clés)", res_multi)


def benchmark_read_mongodb():
    """find_one, find avec range, aggregate pipeline."""
    client = MongoClient("mongodb://admin:admin123@localhost:27017/")
    db = client["benchmark"]

    db.products.create_index("price")

    def find_one():
        db.products.find_one({"_id": random.randint(0, 99999)})

    res_find = measure_latency(find_one, 1000)
    print_results("MongoDB — find_one (par _id)", res_find)

    def find_range():
        list(db.products.find({"price": {"$gte": 10000, "$lte": 50000}}).limit(10))

    res_range = measure_latency(find_range, 500)
    print_results("MongoDB — find range (price)", res_range)

    def aggregate():
        list(db.products.aggregate([
            {"$group": {"_id": "$category", "avg_price": {"$avg": "$price"}, "count": {"$sum": 1}}}
        ]))

    res_agg = measure_latency(aggregate, 200)
    print_results("MongoDB — Aggregation (group by category)", res_agg)
    client.close()



def benchmark_concurrent(db_fn: Callable, n_clients: int = 50, requests_per_client: int = 200):
    """
    Lancer n_clients threads simultanés.
    Chaque thread effectue requests_per_client requêtes.
    Mesure les latences globales et la dégradation vs single client.
    """
    all_latencies = []
    lock = threading.Lock()

    def client_worker():
        local_latencies = []
        for _ in range(requests_per_client):
            start = time.perf_counter()
            db_fn()
            local_latencies.append((time.perf_counter() - start) * 1000)
        with lock:
            all_latencies.extend(local_latencies)

    threads = [threading.Thread(target=client_worker) for _ in range(n_clients)]
    start = time.time()
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    elapsed = time.time() - start

    all_latencies.sort()
    total_requests = n_clients * requests_per_client
    print(f"\n Charge Concurrente ({n_clients} clients × {requests_per_client} req)")
    print(f"  Total requêtes  : {total_requests:,}")
    print(f"  Durée totale    : {elapsed:.2f}s")
    print(f"  Throughput      : {total_requests/elapsed:,.0f} req/s")
    print(f"  Latence p50     : {all_latencies[int(0.5*len(all_latencies))]:.2f}ms")
    print(f"  Latence p95     : {all_latencies[int(0.95*len(all_latencies))]:.2f}ms")
    print(f"  Latence p99     : {all_latencies[int(0.99*len(all_latencies))]:.2f}ms")



if __name__ == "__main__":
    print(" Benchmark NoSQL - Comparatif des 4 technologies")
    print("="*60)

    N = 10_000  

    print(f"\n Benchmark Écriture ({N:,} enregistrements)")
    benchmark_write_redis(N)
    benchmark_write_mongodb(N)
    benchmark_write_cassandra(N)

    print(f"\n Benchmark Lecture (1,000 requêtes)")
    benchmark_read_redis()
    benchmark_read_mongodb()

    print(f"\n Test Charge Concurrente (50 clients × Redis)")
    r = redis.Redis(host='localhost', port=6379, decode_responses=True)
    benchmark_concurrent(
        lambda: r.hgetall(f"bench:product:{random.randint(0, N-1)}"),
        n_clients=50, requests_per_client=200
    )

    print("\n✅ Benchmark terminé ! Consultez RAPPORT.md pour l'analyse.")
