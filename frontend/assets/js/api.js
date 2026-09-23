// URL base da sua API hospedada no Render
const API_BASE_URL = 'https://acervo-escrevivencia.onrender.com';

/**
 * Busca todas as memórias cadastradas no backend
 * Endpoint: GET /api/memorias
 */
async function fetchMemorias() {
  const response = await fetch(`${API_BASE_URL}/api/memorias`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Envia uma tentativa de desbloqueio para um enigma específico
 * Endpoint: POST /api/desbloquear
 */
async function destravarMemoria(id, chave) {
  const response = await fetch(`${API_BASE_URL}/api/desbloquear`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
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