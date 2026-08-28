import sqlite3
import os
from typing import List, Optional, Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "acervo_escape.db")

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memorias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                personagem TEXT NOT NULL,
                chave_secreta TEXT NOT NULL,
                conteudo_bloqueado TEXT NOT NULL,
                conteudo_revelado TEXT NOT NULL,
                pista_proximo_passo TEXT NOT NULL,
                desbloqueado INTEGER DEFAULT 0,
                ordem INTEGER NOT NULL
            )
        """)
        conn.commit()

def listar_todas_memorias() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM memorias ORDER BY ordem ASC")
        rows = cursor.fetchall()
        return [dict(r) for r in rows]

def buscar_memoria_por_id(memoria_id: int) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM memorias WHERE id = ?", (memoria_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def atualizar_status_desbloqueio(memoria_id: int, status: int = 1):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE memorias SET desbloqueado = ? WHERE id = ?", (status, memoria_id))
        conn.commit()

def inserir_memoria(dados: dict) -> int:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO memorias (titulo, personagem, chave_secreta, conteudo_bloqueado, conteudo_revelado, pista_proximo_passo, ordem)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            dados["titulo"],
            dados["personagem"],
            dados["chave_secreta"],
            dados["conteudo_bloqueado"],
            dados["conteudo_revelado"],
            dados["pista_proximo_passo"],
            dados["ordem"]
        ))
        conn.commit()
        return cursor.lastrowid

def resetar_todas_memorias():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE memorias SET desbloqueado = 0")
        conn.commit()