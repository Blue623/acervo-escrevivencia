from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from .models import MemoriaCreate, DesbloqueioRequest, MemoriaResponse
from .utils import normalizar_texto
from .database import (
    init_db,
    listar_todas_memorias,
    buscar_memoria_por_id,
    atualizar_status_desbloqueio,
    inserir_memoria,
    resetar_todas_memorias
)

app = FastAPI(
    title="Acervo da Escrevivência API",
    description="API do terminal de memórias para Escape Room literário",
    version="1.0.0"
)

# Libera requisições de qualquer origem (GitHub Pages, Live Server, local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/api/memorias", response_model=List[MemoriaResponse])
def get_memorias():
    """Retorna os cards para exibição pública na biblioteca virtual."""
    memorias = listar_todas_memorias()
    resultado = []
    
    for item in memorias:
        is_unlocked = bool(item["desbloqueado"])
        resultado.append(MemoriaResponse(
            id=item["id"],
            titulo=item["titulo"],
            personagem=item["personagem"],
            conteudo_bloqueado=item["conteudo_bloqueado"],
            desbloqueado=is_unlocked,
            ordem=item["ordem"],
            conteudo_revelado=item["conteudo_revelado"] if is_unlocked else None,
            pista_proximo_passo=item["pista_proximo_passo"] if is_unlocked else None
        ))
    return resultado

@app.post("/api/desbloquear")
def post_desbloquear(payload: DesbloqueioRequest):
    """Valida a tentativa de senha do jogador."""
    memoria = buscar_memoria_por_id(payload.memoria_id)
    if not memoria:
        raise HTTPException(status_code=404, detail="Registro não encontrado.")

    chave_cadastrada = normalizar_texto(memoria["chave_secreta"])
    chave_recebida = normalizar_texto(payload.chave)

    if chave_recebida == chave_cadastrada:
        atualizar_status_desbloqueio(payload.memoria_id, 1)
        return {
            "status": "sucesso",
            "mensagem": "Registro decodificado com sucesso!",
            "conteudo_revelado": memoria["conteudo_revelado"],
            "pista_proximo_passo": memoria["pista_proximo_passo"]
        }
    
    raise HTTPException(status_code=400, detail="Chave incorreta. Analise as pistas novamente.")

@app.post("/api/memorias/cadastrar", status_code=201)
def post_cadastrar_memoria(memoria: MemoriaCreate):
    """Endpoint para cadastro dos dados literários."""
    novo_id = inserir_memoria(memoria.model_dump())
    return {"status": "sucesso", "mensagem": "Memória cadastrada com sucesso!", "id": novo_id}

@app.post("/api/admin/reset")
def post_reset_jogo():
    """Restaura todos os registros para 'bloqueado' entre rodadas do Escape Room."""
    resetar_todas_memorias()
    return {"status": "sucesso", "mensagem": "Todas as memórias foram rebloqueadas para uma nova partida."}