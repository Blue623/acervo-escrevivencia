from pydantic import BaseModel
from typing import Optional

class MemoriaCreate(BaseModel):
    titulo: str
    personagem: str
    chave_secreta: str
    conteudo_bloqueado: str
    conteudo_revelado: str
    pista_proximo_passo: str
    ordem: int

class DesbloqueioRequest(BaseModel):
    memoria_id: int
    chave: str

class MemoriaResponse(BaseModel):
    id: int
    titulo: str
    personagem: str
    conteudo_bloqueado: str
    desbloqueado: bool
    ordem: int
    conteudo_revelado: Optional[str] = None
    pista_proximo_passo: Optional[str] = None