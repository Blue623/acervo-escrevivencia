document.addEventListener('DOMContentLoaded', () => {
  carregarAcervo();
});

/**
 * Carrega a lista de enigmas e renderiza no container
 */
async function carregarAcervo() {
  // Procura pelo container na tela (suporta os IDs comumente usados)
  const container = document.getElementById('cards-container') || document.getElementById('acervo-container');
  
  if (!container) {
    console.error('Container de cards não encontrado na página.');
    return;
  }

  try {
    const memorias = await fetchMemorias();

    container.innerHTML = '';

    // Estado quando não há enigmas salvos na API
    if (!memorias || memorias.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #a0a0a0;">
          <p>Nenhum enigma literário registrado no Acervo ainda.</p>
          <p style="margin-top: 10px;">
            <a href="cadastro.html" style="color: var(--accent-primary, #e67e22); text-decoration: underline;">
              Clique aqui para cadastrar um novo enigma.
            </a>
          </p>
        </div>
      `;
      return;
    }

    // Renderiza cada enigma cadastrado
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
        <p style="font-size: 0.85rem; color: #999; margin-top: 5px;">Se a API estiver em repouso no Render, aguarde 30 segundos e recarregue a página.</p>
      </div>
    `;
  }
}

/**
 * Função acionada pelo botão do card para testar a senha
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
      
      // Recarrega os cards na tela para mostrar o conteúdo aberto
      await carregarAcervo();

      // Se todas as fases foram concluídas
      if (resultado.vitoria_geral) {
        const banner = document.getElementById('banner-vitoria');
        if (banner) {
          banner.style.display = 'block';
          const codMestre = document.getElementById('codigo-mestre');
          if (codMestre) codMestre.textContent = resultado.codigo_mestre;
        } else {
          alert(`PARABÉNS! Você destravou todos os enigmas!\nCÓDIGO MESTRE: ${resultado.codigo_mestre}`);
        }
      }
    } else {
      alert(resultado.mensagem || 'Chave incorreta. Tente novamente!');
      input.value = '';
      input.focus();
    }
  } catch (err) {
    console.error('Erro na requisição de desbloqueio:', err);
    alert('Erro ao comunicar com a API para desbloquear.');
  }
}