const API_BASE_URL = 'https://acervo-escrevivencia.onrender.com'; // Ajuste conforme a sua URL exata

document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    titulo: document.getElementById('titulo').value,
    personagem: document.getElementById('personagem').value,
    chave_secreta: document.getElementById('chave_secreta').value,
    previa_bloqueada: document.getElementById('previa_bloqueada').value,
    texto_revelado: document.getElementById('texto_revelado').value,
    pista: document.getElementById('pista').value,
    ordem: parseInt(document.getElementById('ordem').value, 10)
  };

  try {
    const res = await fetch(`${API_BASE_URL}/memorias/cadastrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert('Enigma cadastrado com sucesso!');
      document.getElementById('form-cadastro').reset();
    } else {
      const err = await res.json();
      alert(`Erro ao cadastrar: ${JSON.stringify(err.detail || err)}`);
    }
  } catch (error) {
    console.error('Erro de conexão:', error);
    alert('Erro ao conectar com a API. Verifique se o servidor está acordado.');
  }
});