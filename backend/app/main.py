from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Acervo Escrevivência API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas de validação
class MemoriaCreate(BaseModel):
    titulo: str
    personagem: str
    chave_secreta: str
    previa_bloqueada: str
    texto_revelado: str
    pista: str
    ordem: int

class DesbloqueioRequest(BaseModel):
    memoria_id: int
    chave: str

# Base vazia: nenhum enigma nasce pré-cadastrado no código
db_memorias = []

@app.get("/api/memorias")
def get_memorias():
    # Retorna estritamente o que foi cadastrado via tela de cadastro
    return sorted(db_memorias, key=lambda x: x["ordem"])

@app.post("/api/memorias/cadastrar", status_code=status.HTTP_201_CREATED)
def post_cadastrar_memoria(memoria: MemoriaCreate):
    novo_id = len(db_memorias) + 1
    registro = {
        "id": novo_id,
        "titulo": memoria.titulo,
        "personagem": memoria.personagem,
        "chave_secreta": memoria.chave_secreta.strip().lower(),
        "previa_bloqueada": memoria.previa_bloqueada,
        "texto_revelado": memoria.texto_revelado,
        "pista": memoria.pista,
        "ordem": memoria.ordem,
        "desbloqueado": False
    }
    db_memorias.append(registro)
    return {"mensagem": "Registro cadastrado com sucesso!", "id": novo_id}

@app.post("/api/desbloquear")
def post_desbloquear(dados: DesbloqueioRequest):
    memoria = next((m for m in db_memorias if m["id"] == dados.memoria_id), None)
    if not memoria:
        raise HTTPException(status_code=404, detail="Registro não encontrado.")
    
    if memoria["chave_secreta"] == dados.chave.strip().lower():
        memoria["desbloqueado"] = True
        todos_destravados = len(db_memorias) > 0 and all(m["desbloqueado"] for m in db_memorias)
        return {
            "sucesso": True,
            "texto_revelado": memoria["texto_revelado"],
            "vitoria_geral": todos_destravados,
            "codigo_mestre": "CONCEICAO-1952" if todos_destravados else None
        }
    return {"sucesso": False, "mensagem": "Chave incorreta. Tente novamente."}