let socket = null;

document.addEventListener('DOMContentLoaded', () => {
  carregarAcervo();
  iniciarWebSocket();

  const btnReset = document.getElementById('btn-reiniciar');
  if (btnReset) {
    btnReset.addEventListener('click', reiniciarRodada);
  }
});

/**
 * Abre conexão WebSocket com reconexão automática
 */
function iniciarWebSocket() {
  try {
    socket = new WebSocket(WS_BASE_URL);

    socket.onopen = () => {
      console.log('⚡ Conexão em tempo real ativa com o Acervo.');
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        // Se algum enigma foi destravado por qualquer jogador
        if (payload.tipo === 'ENIGMA_DESBLOQUEADO') {
          carregarAcervo(); // Atualiza a tela de todos instantaneamente

          if (payload.vitoria_geral) {
            alert(`🎉 PARABÉNS! O enigma final foi resolvido!\nCÓDIGO MESTRE: ${payload.codigo_mestre}`);
          }
        }

        // Se o mediador ou jogador reiniciou a rodada
        if (payload.tipo === 'RODADA_REINICIADA') {
          alert('A rodada foi reiniciada pelo mediador!');
          carregarAcervo();
        }

        // Se novos cards foram criados/editados/deletados
        if (payload.tipo === 'ACERVO_ATUALIZADO') {
          carregarAcervo();
        }
      } catch (e) {
        console.error('Erro ao processar mensagem do WebSocket:', e);
      }
    };

    socket.onclose = () => {
      console.warn('Conexão WebSocket encerrada. Tentando reconectar em 3 segundos...');
      setTimeout(iniciarWebSocket, 3000);
    };

    socket.onerror = (err) => {
      console.error('Erro na conexão WebSocket:', err);
      socket.close();
    };
  } catch (error) {
    console.error('Falha ao inicializar WebSocket:', error);
    setTimeout(iniciarWebSocket, 5000);
  }
}

/**
 * Renderiza os cards na tela
 */
async function carregarAcervo() {
  const container = document.getElementById('cards-container') || document.getElementById('acervo-container');
  if (!container) return;

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
    console.error('Falha ao carregar acervo:', error);
  }
}

/**
 * Executa o envio da palavra-chave
 */
async function executarDesbloqueio(id) {
  const input = document.getElementById(`input-${id}`);
  if (!input) return;

  const chave = input.value.trim();
  if (!chave) {
    alert('Digite a palavra-chave para tentar desbloquear!');
    input.focus();
    return;
  }

  try {
    const resultado = await destravarMemoria(id, chave);

    if (!resultado.sucesso) {
      alert(resultado.mensagem || 'Chave incorreta. Tente novamente!');
      input.value = '';
      input.focus();
    }
    // Quando acertar, o WebSocket avisará todos (inclusive este aparelho) e chamará carregarAcervo()
  } catch (err) {
    console.error('Erro na requisição de desbloqueio:', err);
    alert('Erro ao tentar conectar com a API.');
  }
}

/**
 * Reinicia o progresso da rodada
 */
async function reiniciarRodada() {
  if (confirm("Deseja realmente reiniciar a rodada? Todos os enigmas voltarão ao estado bloqueado.")) {
    try {
      await resetarRodadaApi();
    } catch (e) {
      console.error(e);
      alert('Erro ao reiniciar a rodada.');
    }
  }
}