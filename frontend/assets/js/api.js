const API_BASE_URL = 'http://localhost:8000/api';

async function fetchMemorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/memorias`);
        if (!response.ok) throw new Error('Erro ao carregar o acervo');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function enviarDesbloqueio(memoriaId, chave) {
    try {
        const response = await fetch(`${API_BASE_URL}/desbloquear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memoria_id: memoriaId, chave: chave })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Chave incorreta');
        return { sucesso: true, dados: data };
    } catch (error) {
        return { sucesso: false, mensagem: error.message };
    }
}

async function resetarJogo() {
    await fetch(`${API_BASE_URL}/admin/reset`, { method: 'POST' });
    location.reload();
}