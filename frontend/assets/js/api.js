// URLs oficiais no Render (HTTP e WebSocket com SSL)
const API_BASE_URL = 'https://acervo-escrevivencia.onrender.com';
const WS_BASE_URL = 'wss://acervo-escrevivencia.onrender.com/ws';

/**
 * READ: Busca lista de memórias
 */
async function fetchMemorias() {
  const response = await fetch(`${API_BASE_URL}/api/memorias`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Erro ao obter memórias: ${response.status}`);
  }

  return await response.json();
}

/**
 * CREATE: Cadastra nova memória
 */
async function cadastrarMemoria(payload) {
  const response = await fetch(`${API_BASE_URL}/api/memorias/cadastrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(JSON.stringify(err.detail || err));
  }

  return await response.json();
}

/**
 * UPDATE: Atualiza uma memória existente
 */
async function atualizarMemoria(id, payload) {
  const response = await fetch(`${API_BASE_URL}/api/memorias/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(JSON.stringify(err.detail || err));
  }

  return await response.json();
}

/**
 * DELETE: Remove uma memória
 */
async function deletarMemoria(id) {
  const response = await fetch(`${API_BASE_URL}/api/memorias/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Erro ao excluir memória: ${response.status}`);
  }

  return await response.json();
}

/**
 * POST: Tenta destravar a memória com a chave
 */
async function destravarMemoria(id, chave) {
  const response = await fetch(`${API_BASE_URL}/api/desbloquear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memoria_id: id,
      chave: chave
    })
  });

  if (!response.ok) {
    throw new Error(`Erro na validação: ${response.status}`);
  }

  return await response.json();
}

/**
 * POST: Reinicia o status de todos os enigmas
 */
async function resetarRodadaApi() {
  const response = await fetch(`${API_BASE_URL}/api/reiniciar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Erro ao reiniciar rodada: ${response.status}`);
  }

  return await response.json();
}