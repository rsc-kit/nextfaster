"""
NextFaster's Postgres dump, as a SQLite database for D1.

The dump is five COPY blocks: collections, categories, subcollections,
subcategories, products - a million products, 2,587 distinct images shared
between them. Everything the app reads is here; users and orders are made
at runtime. Image urls are kept as the path under the bucket, so the host
is the deployment's, not the dump's.

  python3 scripts/convert.py data/data.sql data/nextfaster.sqlite
"""

import sqlite3
import sys

BLOB = "https://bevgyjm5apuichhj.public.blob.vercel-storage.com/"

SCHEMA = """
CREATE TABLE collections (id INTEGER PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL);
CREATE TABLE categories (slug TEXT PRIMARY KEY, name TEXT NOT NULL, collection_id INTEGER NOT NULL REFERENCES collections(id), image_url TEXT);
CREATE INDEX categories_collection_id_idx ON categories(collection_id);
CREATE TABLE subcollections (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category_slug TEXT NOT NULL REFERENCES categories(slug));
CREATE INDEX subcollections_category_slug_idx ON subcollections(category_slug);
CREATE TABLE subcategories (slug TEXT PRIMARY KEY, name TEXT NOT NULL, subcollection_id INTEGER NOT NULL REFERENCES subcollections(id), image_url TEXT);
CREATE INDEX subcategories_subcollection_id_idx ON subcategories(subcollection_id);
CREATE TABLE products (slug TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, price REAL NOT NULL, subcategory_slug TEXT NOT NULL REFERENCES subcategories(slug), image_url TEXT);
CREATE INDEX products_subcategory_slug_idx ON products(subcategory_slug);
CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE VIRTUAL TABLE products_fts USING fts5(name, slug UNINDEXED, content='products', content_rowid='rowid');
"""

def unescape(field: str):
    if field == "\\N":
        return None
    out = []
    i = 0
    while i < len(field):
        c = field[i]
        if c == "\\" and i + 1 < len(field):
            n = field[i + 1]
            out.append({"n": "\n", "t": "\t", "r": "\r", "\\": "\\", "b": "\b", "f": "\f", "v": "\v"}.get(n, n))
            i += 2
        else:
            out.append(c)
            i += 1
    return "".join(out)

def image(path):
    return None if path is None else path.replace(BLOB, "")

def main(src, dst):
    db = sqlite3.connect(dst)
    db.executescript("PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF;")
    db.executescript(SCHEMA)
    inserts = {
        "collections": ("INSERT INTO collections VALUES (?,?,?)", lambda f: (int(f[0]), f[1], f[2])),
        "categories": ("INSERT INTO categories VALUES (?,?,?,?)", lambda f: (f[0], f[1], int(f[2]), image(f[3]))),
        "subcollections": ("INSERT INTO subcollections VALUES (?,?,?)", lambda f: (int(f[0]), f[1], f[2])),
        "subcategories": ("INSERT INTO subcategories VALUES (?,?,?,?)", lambda f: (f[0], f[1], int(f[2]), image(f[3]))),
        "products": ("INSERT INTO products VALUES (?,?,?,?,?,?)", lambda f: (f[0], f[1], f[2], float(f[3]), f[4], image(f[5]))),
    }
    table = None
    batch = []
    counts = {}
    with open(src, encoding="utf-8") as f:
        for line in f:
            if table is None:
                if line.startswith("COPY public."):
                    table = line.split()[1].split(".")[1]
                    batch = []
                continue
            if line.startswith("\\."):
                sql, shape = inserts[table]
                db.executemany(sql, batch)
                counts[table] = counts.get(table, 0) + len(batch)
                table = None
                continue
            fields = [unescape(x) for x in line.rstrip("\n").split("\t")]
            batch.append(inserts[table][1](fields))
            if len(batch) >= 50000:
                sql, _ = inserts[table]
                db.executemany(sql, batch)
                counts[table] = counts.get(table, 0) + len(batch)
                batch = []
    db.execute("INSERT INTO products_fts(products_fts) VALUES ('rebuild')")
    db.commit()
    for t, n in counts.items():
        print(f"{t}: {n}")
    for (n,) in db.execute("SELECT count(*) FROM products_fts WHERE products_fts MATCH 'drone'"):
        print(f"fts 'drone': {n}")
    db.close()

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
