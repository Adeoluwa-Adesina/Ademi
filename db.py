"""
db.py — database connection

Priority order:
  1. DATABASE_URL is set → psycopg2 direct connection (used in production on Vercel)
  2. SUPABASE_TOKEN + SUPABASE_PROJECT_REF are set → Supabase Management API
     (fallback for local dev when the direct DB host isn't reachable)

All scripts import get_db() and dict_cursor() from here.
"""

import os
import json

import psycopg2
import psycopg2.extras
import requests as _requests
from dotenv import load_dotenv

load_dotenv()


# ── psycopg2 path ────────────────────────────────────────────────────────────

def _pg_connect():
    url = os.environ["DATABASE_URL"]
    return psycopg2.connect(url)


def dict_cursor(con):
    """Return a cursor that yields rows as dicts (works for both backends)."""
    if isinstance(con, _MgmtConn):
        return con.cursor()
    return con.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


# ── Management API path ───────────────────────────────────────────────────────

def _quote_param(val):
    """Safely embed a Python value into a SQL literal."""
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)):
        return str(val)
    return "'" + str(val).replace("'", "''") + "'"


def _bind(sql: str, params) -> str:
    """
    Replace %(name)s placeholders with quoted literals.
    Only used in the Management API path; psycopg2 handles its own binding.
    """
    if not params:
        return sql
    if isinstance(params, dict):
        return sql % {k: _quote_param(v) for k, v in params.items()}
    # positional tuple
    parts = iter(_quote_param(v) for v in params)
    return sql.replace("%s", "{}", 1) and sql  # unsupported — always use named params


class _MgmtCursor:
    """Minimal psycopg2-cursor-compatible object backed by the Management API."""

    def __init__(self, token: str, ref: str):
        self._token = token
        self._ref   = ref
        self._rows  = []

    def execute(self, sql: str, params=None) -> None:
        bound = _bind(sql, params)
        url   = f"https://api.supabase.com/v1/projects/{self._ref}/database/query"
        resp = _requests.post(
            url,
            headers={
                "Authorization": f"Bearer {self._token}",
                "Content-Type":  "application/json",
            },
            json={"query": bound},
        )
        resp.raise_for_status()
        data = resp.json()
        self._rows = data if isinstance(data, list) else []

    def fetchone(self):
        return self._rows[0] if self._rows else None

    def fetchall(self):
        return self._rows


class _MgmtConn:
    """
    Minimal psycopg2-connection-compatible object for the Management API path.
    The Management API auto-commits every statement, so 'with con:' is a no-op.
    """

    def __init__(self, token: str, ref: str):
        self._token = token
        self._ref   = ref

    def cursor(self):
        return _MgmtCursor(self._token, self._ref)

    def __enter__(self):
        return self

    def __exit__(self, *_):
        pass  # nothing to commit/rollback — API is statement-level

    def close(self):
        pass


# ── public API ────────────────────────────────────────────────────────────────

def get_db():
    """
    Return a database connection (psycopg2) or a Management API pseudo-connection.
    Callers use dict_cursor(con) to get a cursor and 'with con:' for transactions.
    """
    if os.environ.get("DATABASE_URL"):
        return _pg_connect()

    token = os.environ.get("SUPABASE_TOKEN")
    ref   = os.environ.get("SUPABASE_PROJECT_REF")
    if token and ref:
        return _MgmtConn(token, ref)

    raise RuntimeError(
        "Set DATABASE_URL for a direct DB connection, or "
        "SUPABASE_TOKEN + SUPABASE_PROJECT_REF to use the Management API."
    )
