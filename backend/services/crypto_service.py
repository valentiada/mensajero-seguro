"""Крипто-сервіс: HD-гаманці BSC, моніторинг блоків, зарахування депозитів."""
from __future__ import annotations

import json
import logging
import queue
import threading
import time
from typing import TYPE_CHECKING

from ..config import (
    BSC_MASTER_MNEMONIC,
    BSC_RPC_URL,
    CRYPTO_MONITOR_ENABLED,
    DEPOSIT_CREDIT_CONFIRMATIONS,
    DEPOSIT_FULL_CONFIRMATIONS,
    DEPOSIT_INSTANT_LIMIT_USDT,
    USDT_BEP20_CONTRACT,
)
from ..repositories.casino_repository import CasinoRepository
from ..repositories.crypto_repository import CryptoRepository

logger = logging.getLogger(__name__)

# ERC-20 minimal ABI: Transfer event + balanceOf
_ERC20_ABI = json.loads('''[
  {"anonymous":false,"inputs":[
    {"indexed":true,"name":"from","type":"address"},
    {"indexed":true,"name":"to","type":"address"},
    {"indexed":false,"name":"value","type":"uint256"}
  ],"name":"Transfer","type":"event"},
  {"constant":true,"inputs":[{"name":"account","type":"address"}],
   "name":"balanceOf","outputs":[{"name":"","type":"uint256"}],
   "stateMutability":"view","type":"function"}
]''')

# SSE queues keyed by user_id; each value is a list of Queue objects (one per open tab)
_sse_queues: dict[int, list[queue.Queue]] = {}
_sse_lock = threading.Lock()


def _push_sse(user_id: int, event: dict) -> None:
    with _sse_lock:
        for q in _sse_queues.get(user_id, []):
            try:
                q.put_nowait(event)
            except queue.Full:
                pass


def subscribe_sse(user_id: int) -> queue.Queue:
    q: queue.Queue = queue.Queue(maxsize=50)
    with _sse_lock:
        _sse_queues.setdefault(user_id, []).append(q)
    return q


def unsubscribe_sse(user_id: int, q: queue.Queue) -> None:
    with _sse_lock:
        lst = _sse_queues.get(user_id, [])
        try:
            lst.remove(q)
        except ValueError:
            pass


class CryptoService:
    def __init__(self) -> None:
        self._repo = CryptoRepository()
        self._casino = CasinoRepository()

    # ── HD wallet ─────────────────────────────────────────────────────────────

    def _get_web3(self):
        from web3 import Web3
        w3 = Web3(Web3.HTTPProvider(BSC_RPC_URL, request_kwargs={'timeout': 10}))
        return w3

    def _derive_address(self, index: int) -> str:
        from eth_account import Account
        Account.enable_unaudited_hdwallet_features()
        acc = Account.from_mnemonic(
            BSC_MASTER_MNEMONIC,
            account_path=f"m/44'/60'/0'/0/{index}",
        )
        return acc.address  # checksummed

    def get_or_create_deposit_address(self, user_id: int) -> dict:
        row = self._repo.get_address_by_user(user_id)
        if row:
            return {'address': row['address'], 'token': 'USDT', 'network': 'BEP-20 (BSC)'}

        if not BSC_MASTER_MNEMONIC:
            # Demo mode: return a placeholder
            placeholder = f'0x000000000000000000000000000000000{user_id:08d}'
            return {'address': placeholder, 'token': 'USDT', 'network': 'BEP-20 (BSC)', 'demo': True}

        idx = self._repo.next_deriv_index()
        address = self._derive_address(idx)
        self._repo.save_address(user_id, address, idx)
        return {'address': address, 'token': 'USDT', 'network': 'BEP-20 (BSC)'}

    # ── Deposit list ──────────────────────────────────────────────────────────

    def list_deposits(self, user_id: int) -> list[dict]:
        rows = self._repo.list_user_deposits(user_id)
        return [self._fmt_deposit(r) for r in rows]

    @staticmethod
    def _fmt_deposit(row: dict) -> dict:
        return {
            'id': row['id'],
            'tx_hash': row['tx_hash'],
            'token': row['token'],
            'amount_usdt': float(row['amount_usdt']),
            'confirmations': row['confirmations'],
            'status': row['status'],
            'block_number': row['block_number'],
            'credited_at': row.get('credited_at'),
            'confirmed_at': row.get('confirmed_at'),
            'created_at': row['created_at'],
        }

    # ── Credit logic (called by monitor) ─────────────────────────────────────

    def _credit_deposit(self, deposit: dict) -> None:
        user_id = deposit['user_id']
        dep_id = deposit['id']
        amount = float(deposit['amount_usdt'])

        self._casino.ensure_wallet(user_id)
        new_balance = self._casino.update_balance(user_id, amount)
        self._repo.mark_credited(dep_id)

        logger.info('Credited %.4f USDT to user %d (tx %s)', amount, user_id, deposit['tx_hash'])

        _push_sse(user_id, {
            'type': 'deposit_credited',
            'amount_usdt': amount,
            'new_balance': new_balance,
            'tx_hash': deposit['tx_hash'],
            'token': deposit['token'],
        })

    # ── BSC block monitor ─────────────────────────────────────────────────────

    def start_monitor(self) -> None:
        t = threading.Thread(target=self._monitor_loop, daemon=True, name='bsc-monitor')
        t.start()
        logger.info('BSC block monitor started')

    def _monitor_loop(self) -> None:
        while True:
            try:
                self._poll_once()
            except Exception:
                logger.exception('BSC monitor error')
            time.sleep(3)  # BSC block time ~3 sec

    def _poll_once(self) -> None:
        w3 = self._get_web3()
        if not w3.is_connected():
            logger.warning('BSC RPC not connected')
            return

        # Build lookup: lowercase_address → user_id
        addr_rows = self._repo.list_all_addresses()
        if not addr_rows:
            return
        addr_map: dict[str, int] = {r['address'].lower(): r['user_id'] for r in addr_rows}

        contract = w3.eth.contract(
            address=w3.to_checksum_address(USDT_BEP20_CONTRACT),
            abi=_ERC20_ABI,
        )
        latest = w3.eth.block_number

        # Check pending deposits for confirmation updates
        for dep in self._repo.list_pending_deposits():
            try:
                receipt = w3.eth.get_transaction_receipt(dep['tx_hash'])
                if receipt is None:
                    continue
                confs = latest - receipt['blockNumber'] + 1
                if confs >= DEPOSIT_FULL_CONFIRMATIONS:
                    self._repo.update_confirmations(dep['tx_hash'], confs, 'confirmed')
                    logger.info('Deposit %s confirmed (%d confs)', dep['tx_hash'], confs)
                else:
                    self._repo.update_confirmations(dep['tx_hash'], confs, 'pending')
            except Exception:
                logger.exception('Error checking deposit %s', dep['tx_hash'])

        # Scan last 2 blocks for new Transfer events to our addresses
        from_block = max(0, latest - 1)
        try:
            events = contract.events.Transfer.get_logs(  # type: ignore[attr-defined]
                fromBlock=from_block,
                toBlock=latest,
            )
        except Exception:
            logger.exception('Error fetching Transfer logs')
            return

        for ev in events:
            to_addr = ev['args']['to'].lower()
            if to_addr not in addr_map:
                continue
            tx_hash = ev['transactionHash'].hex()
            if self._repo.get_deposit_by_txhash(tx_hash):
                continue  # already processed

            user_id = addr_map[to_addr]
            raw_value = str(ev['args']['value'])
            # USDT BEP-20 has 18 decimals
            amount_usdt = ev['args']['value'] / 10 ** 18
            block_number = ev['blockNumber']
            confs = latest - block_number + 1

            dep_id = self._repo.create_deposit(
                user_id=user_id,
                tx_hash=tx_hash,
                token='USDT',
                amount_raw=raw_value,
                amount_usdt=amount_usdt,
                block_number=block_number,
            )
            self._repo.update_confirmations(tx_hash, confs, 'pending')

            # Credit immediately if >= DEPOSIT_CREDIT_CONFIRMATIONS
            # and within instant limit
            if confs >= DEPOSIT_CREDIT_CONFIRMATIONS:
                if amount_usdt <= DEPOSIT_INSTANT_LIMIT_USDT:
                    dep_row = self._repo.get_deposit_by_txhash(tx_hash)
                    if dep_row:
                        self._credit_deposit(dep_row)
                else:
                    # Large deposit: wait for full confirmations
                    logger.info(
                        'Large deposit %.2f USDT — waiting for %d confs',
                        amount_usdt, DEPOSIT_FULL_CONFIRMATIONS,
                    )
