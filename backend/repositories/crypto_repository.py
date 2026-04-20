"""Репозиторій крипто-депозитів."""
from __future__ import annotations

from ..database import execute, query_all, query_one


class CryptoRepository:

    # ── Deposit addresses ─────────────────────────────────────────────────────

    def get_address_by_user(self, user_id: int) -> dict | None:
        return query_one(
            'SELECT * FROM crypto_deposit_addresses WHERE user_id = ?',
            (user_id,),
        )

    def get_address_by_address(self, address: str) -> dict | None:
        return query_one(
            'SELECT * FROM crypto_deposit_addresses WHERE address = ?',
            (address.lower(),),
        )

    def next_deriv_index(self) -> int:
        row = query_one('SELECT MAX(deriv_index) AS mx FROM crypto_deposit_addresses')
        return (row['mx'] or 0) + 1 if row else 1

    def save_address(self, user_id: int, address: str, deriv_index: int) -> int:
        return execute(
            '''INSERT INTO crypto_deposit_addresses (user_id, address, deriv_index)
               VALUES (?, ?, ?) RETURNING id''',
            (user_id, address.lower(), deriv_index),
        )

    def list_all_addresses(self) -> list[dict]:
        return query_all('SELECT * FROM crypto_deposit_addresses')

    # ── Deposits ──────────────────────────────────────────────────────────────

    def get_deposit_by_txhash(self, tx_hash: str) -> dict | None:
        return query_one(
            'SELECT * FROM crypto_deposits WHERE tx_hash = ?',
            (tx_hash.lower(),),
        )

    def create_deposit(
        self,
        user_id: int,
        tx_hash: str,
        token: str,
        amount_raw: str,
        amount_usdt: float,
        block_number: int,
    ) -> int:
        return execute(
            '''INSERT INTO crypto_deposits
               (user_id, tx_hash, token, amount_raw, amount_usdt, block_number, status)
               VALUES (?, ?, ?, ?, ?, ?, 'pending') RETURNING id''',
            (user_id, tx_hash.lower(), token, amount_raw, amount_usdt, block_number),
        )

    def mark_credited(self, deposit_id: int) -> None:
        from ..database import get_connection
        from ..config import USE_PG
        now_sql = 'NOW()' if USE_PG else "datetime('now')"
        execute(
            f"UPDATE crypto_deposits SET credited_at = {now_sql} WHERE id = ?",
            (deposit_id,),
        )

    def update_confirmations(self, tx_hash: str, confirmations: int, status: str) -> None:
        from ..config import USE_PG
        now_sql = 'NOW()' if USE_PG else "datetime('now')"
        if status == 'confirmed':
            execute(
                f'''UPDATE crypto_deposits
                    SET confirmations = ?, status = ?, confirmed_at = {now_sql}
                    WHERE tx_hash = ?''',
                (confirmations, status, tx_hash.lower()),
            )
        else:
            execute(
                'UPDATE crypto_deposits SET confirmations = ?, status = ? WHERE tx_hash = ?',
                (confirmations, status, tx_hash.lower()),
            )

    def list_user_deposits(self, user_id: int, limit: int = 20) -> list[dict]:
        return query_all(
            '''SELECT * FROM crypto_deposits
               WHERE user_id = ?
               ORDER BY created_at DESC
               LIMIT ?''',
            (user_id, limit),
        )

    def list_pending_deposits(self) -> list[dict]:
        return query_all(
            "SELECT * FROM crypto_deposits WHERE status = 'pending' ORDER BY created_at"
        )
