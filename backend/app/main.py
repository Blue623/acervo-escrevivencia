from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(
    title="API Acervo Escrevivência",
    description="Backend em tempo real para Escape Room Literário",
    version="1.1.0"
)

# CORS liberado para comunicação com a Vercel e testes locais
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GERENCIADOR DE CONEXÕES WEBSOCKET ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# Endpoint WebSocket para os clientes ouvirem os eventos em tempo real
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Mantém a conexão aberta escutando eventuais pings
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


# --- BANCO DE DADOS EM MEMÓRIA ---
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


# --- MODELOS PYDANTIC ---
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


# --- ROTAS REST (CRUD & CONTROLE) ---

@app.get("/")
def raiz():
    return {"status": "API Acervo Escrevivência online", "ws": "/ws"}

@app.get("/api/memorias")
def listar_memorias():
    return sorted(db_memorias, key=lambda x: x.get("ordem", 0))

@app.post("/api/memorias/cadastrar")
async def cadastrar_memoria(dados: MemoriaCreate):
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
    # Notifica todos os aparelhos sobre o novo card
    await manager.broadcast({"tipo": "ACERVO_ATUALIZADO"})
    return {"sucesso": True, "memoria": nova_memoria}

@app.put("/api/memorias/{memoria_id}")
async def atualizar_memoria(memoria_id: int, dados: MemoriaUpdate):
    for m in db_memorias:
        if m["id"] == memoria_id:
            update_data = dados.model_dump(exclude_unset=True) if hasattr(dados, "model_dump") else dados.dict(exclude_unset=True)
            if "chave_secreta" in update_data and update_data["chave_secreta"] is not None:
                update_data["chave_secreta"] = update_data["chave_secreta"].strip().lower()
            m.update(update_data)
            await manager.broadcast({"tipo": "ACERVO_ATUALIZADO"})
            return {"sucesso": True, "memoria": m}
    raise HTTPException(status_code=404, detail="Memória não encontrada")

@app.delete("/api/memorias/{memoria_id}")
async def deletar_memoria(memoria_id: int):
    global db_memorias
    for i, m in enumerate(db_memorias):
        if m["id"] == memoria_id:
            removido = db_memorias.pop(i)
            await manager.broadcast({"tipo": "ACERVO_ATUALIZADO"})
            return {"sucesso": True, "mensagem": f"Memória '{removido['titulo']}' removida"}
    raise HTTPException(status_code=404, detail="Memória não encontrada")

@app.post("/api/desbloquear")
async def destravar_enigma(req: DesbloqueioRequest):
    for m in db_memorias:
        if m["id"] == req.memoria_id:
            if m["chave_secreta"].strip().lower() == req.chave.strip().lower():
                m["desbloqueado"] = True
                
                vitoria = len(db_memorias) > 0 and all(item["desbloqueado"] for item in db_memorias)
                
                # TRANSMITE O DESBLOQUEIO PARA TODAS AS TELAS CONECTADAS NO MESMO INSTANTE
                await manager.broadcast({
                    "tipo": "ENIGMA_DESBLOQUEADO",
                    "memoria_id": m["id"],
                    "titulo": m["titulo"],
                    "vitoria_geral": vitoria,
                    "codigo_mestre": "ESCREVIVENCIA_LIBERDADE_1872" if vitoria else None
                })

                return {
                    "sucesso": True,
                    "mensagem": "Chave correta! Registro destravado.",
                    "vitoria_geral": vitoria,
                    "codigo_mestre": "ESCREVIVENCIA_LIBERDADE_1872" if vitoria else None
                }
            else:
                return {"sucesso": False, "mensagem": "Chave incorreta. Tente novamente."}
                
    raise HTTPException(status_code=404, detail="Memória não encontrada")

@app.post("/api/reiniciar")
async def reiniciar_rodada():
    for m in db_memorias:
        m["desbloqueado"] = False
    
    # Notifica todos os aparelhos que a rodada foi resetada
    await manager.broadcast({"tipo": "RODADA_REINICIADA"})
    return {"sucesso": True, "mensagem": "Rodada reiniciada para todos os participantes"}