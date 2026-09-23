// URL base oficial da API hospedada no Render
const API_BASE_URL = 'https://acervo-escrevivencia.onrender.com';

/**
 * READ: Obtém todas as memórias cadastradas
 * GET /api/memorias
 */
async function fetchMemorias() {
  const response = await fetch(`${API_BASE_URL}/api/memorias`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Falha ao obter dados: ${response.status}`);
  }

  return await response.json();
}

/**
 * CREATE: Cadastra uma nova memória
 * POST /api/memorias/cadastrar
 */
async function cadastrarMemoria(payload) {
  const response = await fetch(`${API_BASE_URL}/api/memorias/cadastrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const erroJson = await response.json();
    throw new Error(JSON.stringify(erroJson.detail || erroJson));
  }

  return await response.json();
}

/**
 * UPDATE: Atualiza os dados de uma memória existente
 * PUT /api/memorias/{id}
 */
async function atualizarMemoria(id, payload) {
  const response = await fetch(`${API_BASE_URL}/api/memorias/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const erroJson = await response.json();
    throw new Error(JSON.stringify(erroJson.detail || erroJson));
  }

  return await response.json();
}

/**
 * DELETE: Exclui uma memória pelo ID
 * DELETE /api/memorias/{id}
 */
async function deletarMemoria(id) {
  const response = await fetch(`${API_BASE_URL}/api/memorias/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Falha ao deletar memória: ${response.status}`);
  }

  return await response.json();
}

/**
 * MECÂNICA ESCAPE ROOM: Envia a tentativa de desbloqueio
 * POST /api/desbloquear
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
    throw new Error(`Erro ao validar chave: ${response.status}`);
  }

  return await response.json();
}