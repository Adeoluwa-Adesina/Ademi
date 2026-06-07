"""
setup_db.py — create tables on Supabase (run once)

  python setup_db.py
"""

from pathlib import Path
from db import get_db

SCHEMA = Path("schema_pg.sql").read_text()


def main() -> None:
    con = get_db()
    try:
        with con:
            cur = con.cursor()
            cur.execute(SCHEMA)
        print("Schema applied.")
    finally:
        con.close()


if __name__ == "__main__":
    main()
