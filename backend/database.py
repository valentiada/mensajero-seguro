"""Абстракція бази даних: SQLite або PostgreSQL."""
from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Generator

from .config import DATABASE_PATH, DATABASE_URL, SCHEMA_PATH, SCHEMA_PG_PATH, USE_PG

if USE_PG:
    import psycopg2
    import psycopg2.extras


class _PgConn:
    """Thin wrapper around psycopg2 connection that mimics sqlite3 interface."""

    def __init__(self, conn):
        self._conn = conn
        self._cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    def execute(self, sql: str, params=()):
        sql = _pg_sql(sql)
        self._cursor.execute(sql, params)
        return self._cursor

    def executemany(self, sql: str, seq):
        sql = _pg_sql(sql)
        self._cursor.executemany(sql, seq)

    def fetchone(self):
        return self._cursor.fetchone()

    def fetchall(self):
        return self._cursor.fetchall()

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._cursor.close()
        self._conn.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, *_):
        if exc_type:
            self.rollback()
        else:
            self.commit()
        self.close()


def _pg_sql(sql: str) -> str:
    return sql.replace('?', '%s').replace('INTEGER PRIMARY KEY AUTOINCREMENT', 'SERIAL PRIMARY KEY')


def _sqlite_row_factory(cursor, row):
    cols = [d[0] for d in cursor.description]
    return dict(zip(cols, row))


@contextmanager
def get_connection() -> Generator:
    if USE_PG:
        conn = psycopg2.connect(DATABASE_URL)
        wrapper = _PgConn(conn)
        try:
            yield wrapper
        except Exception:
            wrapper.rollback()
            raise
        finally:
            wrapper.close()
    else:
        DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(DATABASE_PATH))
        conn.row_factory = _sqlite_row_factory
        conn.execute('PRAGMA foreign_keys = ON')
        conn.execute('PRAGMA journal_mode = WAL')
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()


def init_db() -> None:
    schema_file = SCHEMA_PG_PATH if USE_PG else SCHEMA_PATH
    if not schema_file.exists():
        return
    sql = schema_file.read_text(encoding='utf-8')
    with get_connection() as conn:
        if USE_PG:
            conn.execute(sql)
        else:
            conn._conn.executescript(sql) if hasattr(conn, '_conn') else conn.executescript(sql)


def query_one(sql: str, params=()) -> dict | None:
    with get_connection() as conn:
        cur = conn.execute(sql, params)
        return cur.fetchone()


def query_all(sql: str, params=()) -> list[dict]:
    with get_connection() as conn:
        cur = conn.execute(sql, params)
        return cur.fetchall() or []


def execute(sql: str, params=()) -> int:
    with get_connection() as conn:
        cur = conn.execute(sql, params)
        if USE_PG:
            if 'RETURNING id' in sql.upper():
                row = cur.fetchone()
                return row['id'] if row else 0
            return cur.rowcount
        return cur.lastrowid or cur.rowcount
