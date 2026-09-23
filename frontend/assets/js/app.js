document.addEventListener('DOMContentLoaded', () => {
  carregarAcervo();

  // Vincula a função de reiniciar ao botão estilizado do cabeçalho se ele tiver o id 'btn-reiniciar'
  const btnReset = document.getElementById('btn-reiniciar');
  if (btnReset) {
    btnReset.addEventListener('click', reiniciarRodada);
  }
});

/**
 * Busca e renderiza os cards na página inicial
 */
async function carregarAcervo() {
  const container = document.getElementById('cards-container') || document.getElementById('acervo-container');
  
  if (!container) {
    console.error('Container de cards não encontrado na página.');
    return;
  }

  try {
    const memorias = await fetchMemorias();

    container.innerHTML = '';

    if (!memorias || memorias.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #a0a0a0;">
          <p>Nenhum enigma literário registrado no Acervo ainda.</p>
          <p style="margin-top: 10px;">
            <a href="cadastro.html" style="color: var(--gold, #d4af37); text-decoration: underline;">
              Cadastrar um novo enigma no painel
            </a>
          </p>
        </div>
      `;
      return;
    }

    memorias.forEach((item) => {
      const card = document.createElement('div');
      card.className = `enigma-card ${item.desbloqueado ? 'destravado' : 'bloqueado'}`;
      card.id = `card-${item.id}`;

      card.innerHTML = `
        <div class="card-header">
          <span class="card-badge">Fase ${item.ordem}</span>
          <h2 class="card-title">${item.titulo}</h2>
          <p class="card-voice"><strong>Voz:</strong> <span>${item.personagem}</span></p>
        </div>

        <div class="card-body">
          <div class="pista-container">
            <span class="pista-label">Pista:</span>
            <p class="pista-texto">${item.pista}</p>
          </div>

          <div class="conteudo-container">
            ${item.desbloqueado 
              ? `<div class="texto-revelado-box">
                   <span class="status-tag">Fragmento Revelado</span>
                   <p>${item.texto_revelado}</p>
                 </div>` 
              : `<div class="texto-bloqueado-box">
                   <span class="status-tag">Arquivo Criptografado</span>
                   <p>${item.previa_bloqueada}</p>
                 </div>`
            }
          </div>
        </div>

        <div class="card-footer">
          ${!item.desbloqueado ? `
            <div class="form-desbloqueio">
              <input 
                type="text" 
                id="input-${item.id}" 
                class="input-chave" 
                placeholder="Digite a palavra-chave..." 
                autocomplete="off"
                onkeydown="if(event.key === 'Enter') executarDesbloqueio(${item.id})"
              />
              <button type="button" class="btn-desbloquear" onclick="executarDesbloqueio(${item.id})">
                Desbloquear
              </button>
            </div>
          ` : `
            <div class="status-sucesso-badge">
              <span>✔ Concluído com Sucesso</span>
            </div>
          `}
        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error('Falha ao renderizar acervo:', error);
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: #ff6b6b;">
        <p>Não foi possível conectar ao servidor do Acervo.</p>
        <p style="font-size: 0.85rem; color: #999; margin-top: 5px;">Se a API estiver acordando no Render, aguarde 30 segundos e recarregue a página.</p>
      </div>
    `;
  }
}

/**
 * Tenta destravar o enigma com a senha digitada
 */
async function executarDesbloqueio(id) {
  const input = document.getElementById(`input-${id}`);
  if (!input) return;

  const chave = input.value.trim();
  if (!chave) {
    alert('Por favor, digite a palavra-chave.');
    input.focus();
    return;
  }

  try {
    const resultado = await destravarMemoria(id, chave);

    if (resultado.sucesso) {
      alert('Chave correta! O trecho literário foi revelado.');
      await carregarAcervo();

      if (resultado.vitoria_geral) {
        alert(`PARABÉNS! Todas as fases foram concluídas com sucesso!\nCÓDIGO MESTRE: ${resultado.codigo_mestre}`);
      }
    } else {
      alert(resultado.mensagem || 'Chave incorreta. Tente novamente!');
      input.value = '';
      input.focus();
    }
  } catch (err) {
    console.error('Erro na requisição de desbloqueio:', err);
    alert('Erro ao tentar desbloquear.');
  }
}

/**
 * Reinicia o status de todos os enigmas para 'bloqueado'
 */
async function reiniciarRodada() {
  const confirmou = confirm("Deseja realmente reiniciar a rodada? Todos os enigmas voltarão ao estado bloqueado para uma nova equipe.");
  
  if (!confirmou) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/reiniciar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      alert('Rodada reiniciada! Todos os enigmas foram bloqueados.');
      await carregarAcervo();
    } else {
      alert('Não foi possível reiniciar a rodada na API.');
    }
  } catch (error) {
    console.error('Erro ao reiniciar rodada:', error);
    alert('Erro ao conectar com a API para reiniciar.');
  }
}