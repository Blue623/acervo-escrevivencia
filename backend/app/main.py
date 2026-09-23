from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(
    title="API Acervo Escrevivência",
    description="Backend para o Escape Room literário",
    version="1.0.0"
)

# Configuração de CORS para permitir requisições da Vercel e locais
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Banco de dados em memória (inicializado com o registro de Narcisa Amália)
db_memorias = [
    {
        "id": 1,
        "titulo": "A Voz Rompendo o Nevoeiro",
        "personagem": "Narcisa Amália",
        "chave_secreta": "liberdade",
        "previa_bloqueada": "Em 1872, entre as brumas do preconceito, ergueu-se a voz poética contra o cativeiro.",
        "texto_revelado": "“Foge a noite, o sol desponta...” Narcisa Amália aliou a poesia lírica à abolição e à luta feminina em Nebulosas.",
        "pista": "A chama que guia o poema contra todas as correntes do cativeiro.",
        "ordem": 1,
        "desbloqueado": False
    }
]

# --- SCHEMAS PYDANTIC ---

class MemoriaCreate(BaseModel):
    titulo: str
    personagem: str
    chave_secreta: str
    previa_bloqueada: str
    texto_revelado: str
    pista: str
    ordem: int

class MemoriaUpdate(BaseModel):
    titulo: Optional[str] = None
    personagem: Optional[str] = None
    chave_secreta: Optional[str] = None
    previa_bloqueada: Optional[str] = None
    texto_revelado: Optional[str] = None
    pista: Optional[str] = None
    ordem: Optional[int] = None

class DesbloqueioRequest(BaseModel):
    memoria_id: int
    chave: str


# --- ROTAS DA API ---

@app.get("/")
def raiz():
    return {"status": "API Acervo Escrevivência online", "docs": "/docs"}

# 1. READ: Listar todas as memórias ordenadas
@app.get("/api/memorias")
def listar_memorias():
    return sorted(db_memorias, key=lambda x: x.get("ordem", 0))

# 2. CREATE: Cadastrar nova memória
@app.post("/api/memorias/cadastrar")
def cadastrar_memoria(dados: MemoriaCreate):
    novo_id = max([m["id"] for m in db_memorias], default=0) + 1
    nova_memoria = {
        "id": novo_id,
        "titulo": dados.titulo,
        "personagem": dados.personagem,
        "chave_secreta": dados.chave_secreta.strip().lower(),
        "previa_bloqueada": dados.previa_bloqueada,
        "texto_revelado": dados.texto_revelado,
        "pista": dados.pista,
        "ordem": dados.ordem,
        "desbloqueado": False
    }
    db_memorias.append(nova_memoria)
    return {"sucesso": True, "memoria": nova_memoria}

# 3. UPDATE: Atualizar dados de uma memória existente
@app.put("/api/memorias/{memoria_id}")
def atualizar_memoria(memoria_id: int, dados: MemoriaUpdate):
    for m in db_memorias:
        if m["id"] == memoria_id:
            # Pydantic v2 (model_dump) ou v1 (dict)
            update_data = dados.model_dump(exclude_unset=True) if hasattr(dados, "model_dump") else dados.dict(exclude_unset=True)
            if "chave_secreta" in update_data and update_data["chave_secreta"] is not None:
                update_data["chave_secreta"] = update_data["chave_secreta"].strip().lower()
            m.update(update_data)
            return {"sucesso": True, "memoria": m}
    raise HTTPException(status_code=404, detail="Memória não encontrada")

# 4. DELETE: Remover uma memória
@app.delete("/api/memorias/{memoria_id}")
def deletar_memoria(memoria_id: int):
    global db_memorias
    for i, m in enumerate(db_memorias):
        if m["id"] == memoria_id:
            removido = db_memorias.pop(i)
            return {"sucesso": True, "mensagem": f"Memória '{removido['titulo']}' removida com sucesso"}
    raise HTTPException(status_code=404, detail="Memória não encontrada")

# 5. MECÂNICA ESCAPE ROOM: Desbloqueio com palavra-chave
@app.post("/api/desbloquear")
def destravar_enigma(req: DesbloqueioRequest):
    for m in db_memorias:
        if m["id"] == req.memoria_id:
            if m["chave_secreta"].strip().lower() == req.chave.strip().lower():
                m["desbloqueado"] = True
                
                # Checa se todos os enigmas foram destravados
                vitoria = len(db_memorias) > 0 and all(item["desbloqueado"] for item in db_memorias)
                return {
                    "sucesso": True,
                    "mensagem": "Chave correta! Registro destravado.",
                    "vitoria_geral": vitoria,
                    "codigo_mestre": "ESCREVIVENCIA_LIBERDADE_1872" if vitoria else None
                }
            else:
                return {"sucesso": False, "mensagem": "Chave incorreta. Tente novamente."}
                
    raise HTTPException(status_code=404, detail="Memória não encontrada")