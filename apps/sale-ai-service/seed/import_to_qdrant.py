import os
import csv
import time
import uuid
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from google import genai
from google.genai import types

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", None)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
EMBEDDING_MODEL = "gemini-embedding-001"
VECTOR_SIZE = 3072  # gemini-embedding-001 actual output dimension

SEED_DIR = os.path.dirname(__file__)

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set. Please configure it in .env")

client_gemini = genai.Client(api_key=GEMINI_API_KEY, http_options={"api_version": "v1"})

COLLECTIONS = {
    "product_catalog": {
        "file": "product_catalog.csv",
        "text_fields": ["title", "content", "tags"],
    },
    "faq": {
        "file": "faq.csv",
        "text_fields": ["question", "answer", "tags"],
    },
    "banking_policy": {
        "file": "banking_policy.csv",
        "text_fields": ["title", "content", "tags"],
    },
    "promotions": {
        "file": "promotions.csv",
        "text_fields": ["title", "content", "target_segment", "tags"],
    },
    "competitor_info": {
        "file": "competitor_info.csv",
        "text_fields": ["product_name", "content", "shb_advantage", "tags"],
    },
    "sales_guideline": {
        "file": "sales_guideline.csv",
        "text_fields": ["title", "scenario", "guideline_steps", "tips", "tags"],
    },
}


def load_csv(filepath: str) -> list[dict]:
    rows = []
    with open(filepath, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(dict(row))
    return rows


def make_text_for_embedding(row: dict, text_fields: list[str]) -> str:
    parts = [row.get(f, "") for f in text_fields if row.get(f)]
    return " ".join(parts)


def embed_texts(texts: list[str]) -> list[list[float]]:
    BATCH_SIZE = 100
    all_embeddings = []

    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]

        while True:
            try:
                response = client_gemini.models.embed_content(
                    model=EMBEDDING_MODEL,
                    contents=batch,
                    config=types.EmbedContentConfig(
                        task_type="RETRIEVAL_DOCUMENT",
                    ),
                )
                for emb in response.embeddings:
                    all_embeddings.append(emb.values)
                break  # success, thoat vong lap retry
            except Exception as e:
                err_str = str(e)
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    # Parse retry delay tu message neu co, fallback 65s
                    import re
                    match = re.search(r"retry in (\d+)", err_str)
                    wait_sec = int(match.group(1)) + 5 if match else 65
                    print(f"  [RATE LIMIT] Quota exceeded. Waiting {wait_sec}s before retry...")
                    time.sleep(wait_sec)
                    # retry vong lap while
                else:
                    raise  # loi khac thi throw luon

        if i + BATCH_SIZE < len(texts):
            time.sleep(1)  # delay nhe giua cac batch

    return all_embeddings



def main():
    print(f"{'='*60}")
    print(f"  Qdrant Knowledge Base Import — SHB Sales AI Copilot")
    print(f"{'='*60}")
    print(f"  Qdrant URL   : {QDRANT_URL}")
    print(f"  Embedding    : {EMBEDDING_MODEL} (dim={VECTOR_SIZE})")
    print(f"  Collections  : {len(COLLECTIONS)}")
    print(f"{'='*60}\n")

    qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

    results = []

    for collection_name, config in COLLECTIONS.items():
        filepath = os.path.join(SEED_DIR, config["file"])
        print(f"[{collection_name}]")
        print(f"  File : {config['file']}")

        # Load CSV
        rows = load_csv(filepath)
        print(f"  Rows : {len(rows)} records")

        # Recreate collection (idempotent)
        try:
            qdrant.delete_collection(collection_name)
            print(f"  Info : Deleted existing collection")
        except Exception:
            pass

        qdrant.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )
        print(f"  Info : Collection created (dim={VECTOR_SIZE}, COSINE)")

        # Build texts for embedding
        texts = [make_text_for_embedding(row, config["text_fields"]) for row in rows]

        # Embed via Gemini API
        print(f"  Embed: Calling Gemini API...")
        embeddings = embed_texts(texts)
        print(f"  Embed: Done — {len(embeddings)} vectors")

        # Build Qdrant points
        points = [
            PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding,
                payload=row,
            )
            for row, embedding in zip(rows, embeddings)
        ]

        # Upsert
        qdrant.upsert(collection_name=collection_name, points=points)

        # Verify
        info = qdrant.get_collection(collection_name)
        actual = info.points_count
        expected = len(rows)
        ok = actual == expected
        status = "[OK]" if ok else "[!!]"
        print(f"  {status} Verified: {actual}/{expected} points\n")
        results.append((collection_name, actual, expected, ok))

    # Summary
    print(f"{'='*60}")
    print(f"  IMPORT SUMMARY")
    print(f"{'='*60}")
    total_ok = 0
    total_points = 0
    for name, actual, expected, ok in results:
        status = "[OK]" if ok else "[!!]"
        print(f"  {status}  {name:<20} {actual:>3}/{expected:<3} points")
        total_points += actual
        if ok:
            total_ok += 1
    print(f"{'-'*60}")
    print(f"  Collections : {total_ok}/{len(results)} OK")
    print(f"  Total points: {total_points}")
    print(f"  Vector dim  : {VECTOR_SIZE} (text-embedding-004)")
    print(f"{'='*60}")

    if total_ok == len(results):
        print("\n[DONE] All collections imported successfully!")
    else:
        print("\n[WARN] Some collections have issues. Please check above.")


if __name__ == "__main__":
    main()
