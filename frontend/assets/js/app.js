// frontend/assets/js/app.js

document.addEventListener('DOMContentLoaded', async () => {
    carregarAcervo();
});

async function carregarAcervo() {
    const grid = document.getElementById('grid-memorias');
    grid.innerHTML = '<p style="color: var(--text-muted);">Carregando registros do arquivo...</p>';
    
    const memorias = await fetchMemorias();
    grid.innerHTML = '';

    if (memorias.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-muted);">Nenhum registro encontrado no acervo.</p>';
        return;
    }

    // Renderiza cada card de memória
    memorias.forEach(memoria => {
        const card = document.createElement('div');
        card.className = `card ${memoria.desbloqueado ? 'unlocked' : 'locked'}`;

        if (memoria.desbloqueado) {
            card.innerHTML = `
                <span class="badge badge-unlocked">DESBLOQUEADO</span>
                <h3>${memoria.titulo}</h3>
                <p class="author">Voz: <strong>${memoria.personagem}</strong></p>
                <div class="content">"${memoria.conteudo_revelado}"</div>
                <div class="clue"><strong>Próximo Passo:</strong> ${memoria.pista_proximo_passo}</div>
            `;
        } else {
            card.innerHTML = `
                <span class="badge badge-locked">BLOQUEADO</span>
                <h3>${memoria.titulo}</h3>
                <p class="preview" style="color: var(--text-muted); margin-bottom: 15px;">${memoria.conteudo_bloqueado}</p>
                <div class="form-unlock">
                    <input type="text" id="input-${memoria.id}" placeholder="Chave de acesso...">
                    <button type="button" onclick="tentarDesbloqueio(${memoria.id})">Decodificar</button>
                </div>
            `;
        }
        grid.appendChild(card);
    });

    // Verifica se todos os registros foram desbloqueados para exibir o código final
    const todosDesbloqueados = memorias.length > 0 && memorias.every(m => m.desbloqueado);

    if (todosDesbloqueados) {
        const victoryBanner = document.createElement('div');
        victoryBanner.className = 'card unlocked';
        victoryBanner.style.gridColumn = '1 / -1';
        victoryBanner.style.textAlign = 'center';
        victoryBanner.style.border = '2px solid var(--gold)';
        victoryBanner.style.marginBottom = '20px';
        victoryBanner.innerHTML = `
            <span class="badge badge-unlocked" style="margin: 0 auto 10px auto;">ARQUIVO COMPLETO</span>
            <h2 style="color: var(--gold); margin-bottom: 10px; font-family: var(--font-serif);">TODAS AS MEMÓRIAS FORAM RESGATADAS!</h2>
            <p style="font-size: 1.05rem; margin-bottom: 15px; color: var(--text-main);">A escrevivência rompeu o silêncio do arquivo e reconstruiu os caminhos de Fio Jasmim.</p>
            <div class="clue" style="font-size: 1.15rem; background: rgba(0, 0, 0, 0.4); display: inline-block; padding: 12px 24px; border-left: none; border: 1px dashed var(--gold);">
                <strong>CÓDIGO DE LIBERAÇÃO DA SALA:</strong> <span style="color: var(--gold); font-weight: bold; letter-spacing: 2px;">CONCEICAO-1952</span>
            </div>
        `;
        grid.prepend(victoryBanner);
    }
}

async function tentarDesbloqueio(id) {
    const input = document.getElementById(`input-${id}`);
    const chave = input.value.trim();
    
    if (!chave) {
        alert('Digite uma chave antes de decodificar!');
        return;
    }

    const res = await enviarDesbloqueio(id, chave);
    
    if (res.sucesso) {
        alert(res.dados.mensagem);
        carregarAcervo();
    } else {
        alert(res.mensagem);
    }
}