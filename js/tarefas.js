const formTarefa = document.getElementById('form-tarefa');
const listaTarefasCards = document.getElementById('lista-tarefas-cards');
const listaTarefasTabela = document.getElementById('lista-tarefas-tabela');
const tabelaWrapper = document.getElementById('tarefas-tabela-wrapper');
const cardsWrapper = document.getElementById('tarefas-cards-wrapper');
const btnViewCards = document.getElementById('view-cards');
const btnViewTable = document.getElementById('view-table');
const btnLogout = document.getElementById('btn-logout');

let tarefasCache = [];
let viewMode = 'cards';

setupValidation(formTarefa);


async function carregarTarefas() {
    if (!listaTarefasCards || !listaTarefasTabela) {
        return;
    }

    try {
        const resposta = await apiRequest('/tarefas');
        if (Array.isArray(resposta)) {
            tarefasCache = resposta;
        } else if (Array.isArray(resposta?.tarefas)) {
            tarefasCache = resposta.tarefas;
        } else if (Array.isArray(resposta?.data)) {
            tarefasCache = resposta.data;
        } else {
            tarefasCache = [];
        }

        renderTarefas();
    } catch (erro) {
        mostrarResultado(`Erro ao carregar tarefas: ${erro.message}`, 'error');
    }
}

function renderTarefas() {
    listaTarefasCards.innerHTML = '';
    listaTarefasTabela.innerHTML = '';

    if (!tarefasCache.length) {
        const empty = `
            <div class="empty-state">
                <p>Nenhuma tarefa encontrada.<br>Crie sua primeira tarefa acima!</p>
            </div>
        `;

        listaTarefasCards.innerHTML = empty;
        listaTarefasTabela.innerHTML = '<tr><td colspan="3">Nenhuma tarefa encontrada.</td></tr>';
        aplicarModoVisualizacao();
        return;
    }

    tarefasCache.forEach((tarefa) => {
        const tituloSeguro = JSON.stringify(tarefa.titulo).replace(/"/g, '&quot;');

        const card = document.createElement('div');
        card.className = `tarefa-card${tarefa.concluida ? ' done' : ''}`;
        card.innerHTML = `
            <span class="badge ${tarefa.concluida ? 'done' : 'pending'}">
                ${tarefa.concluida ? 'Concluida' : 'Pendente'}
            </span>
            <div class="tarefa-card-title"> <b>#${tarefa.id}</b> ${tarefa.titulo}</div>
            <div class="tarefa-card-actions">
                <button class="small" onclick="toggleTarefa(${tarefa.id}, ${tarefa.concluida}, ${tituloSeguro})">
                    ${tarefa.concluida ? 'Reabrir' : 'Concluir'}
                </button>
                <button class="small danger" onclick="excluirTarefa(${tarefa.id})">Excluir</button>
            </div>
        `;
        listaTarefasCards.appendChild(card);

        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${tarefa.id}</td>
            <td>${tarefa.titulo}</td>
            <td>
                <span class="status ${tarefa.concluida ? 'done' : 'pending'}">
                    ${tarefa.concluida ? 'Concluida' : 'Pendente'}
                </span>
            </td>
            <td>
                <button class="small" onclick="toggleTarefa(${tarefa.id}, ${tarefa.concluida}, ${tituloSeguro})">
                    ${tarefa.concluida ? 'Reabrir' : 'Concluir'}
                </button>
                <button class="small danger" onclick="excluirTarefa(${tarefa.id})">Excluir</button>
            </td>
        `;
        listaTarefasTabela.appendChild(linha);
    });

    aplicarModoVisualizacao();
}

function aplicarModoVisualizacao() {
    if (!cardsWrapper || !tabelaWrapper || !btnViewCards || !btnViewTable) {
        return;
    }

    const isCardsView = viewMode === 'cards';
    const isTableView = !isCardsView;

    // Exibição
    cardsWrapper.classList.toggle('is-hidden', isTableView);
    tabelaWrapper.classList.toggle('is-hidden', isCardsView);

    // Botões ativos
    btnViewCards.classList.toggle('active', isCardsView);
    btnViewTable.classList.toggle('active', isTableView);

    // Estilo secundário
    btnViewCards.classList.toggle('secondary', isTableView);
    btnViewTable.classList.toggle('secondary', isCardsView);
}

async function criarTarefa(event) {
    event.preventDefault();

    const titulo = document.getElementById('tarefa-titulo').value.trim();
    if (!titulo) {
        mostrarResultado('O título da tarefa não pode ficar vazio.', 'error');
        return;
    }

    try {
        await apiRequest('/tarefas', { method: 'POST', body: { titulo } });
        formTarefa.reset();
        await carregarTarefas();
        mostrarResultado('Tarefa criada com sucesso.');
    } catch (erro) {
        mostrarResultado(`Erro ao criar tarefa: ${erro.message}`, 'error');
    }
}

async function toggleTarefa(id, concluida, titulo) {
    try {
        await apiRequest(`/tarefas/${id}`, {
            method: 'PUT',
            body: { titulo, concluida: !concluida },
        });
        await carregarTarefas();
        mostrarResultado('Status da tarefa atualizado.');
    } catch (erro) {
        mostrarResultado(`Erro ao atualizar tarefa: ${erro.message}`, 'error');
    }
}

async function excluirTarefa(id) {
    if (!confirm('Deseja excluir esta tarefa?')) {
        return;
    }

    try {
        await apiRequest(`/tarefas/${id}`, { method: 'DELETE' });
        await carregarTarefas();
        mostrarResultado('Tarefa excluída.');
    } catch (erro) {
        mostrarResultado(`Erro ao excluir tarefa: ${erro.message}`, 'error');
    }
}

if (formTarefa) {
    formTarefa.addEventListener('submit', criarTarefa);
}

if (btnLogout) {
    btnLogout.addEventListener('click', () => logout(true));
}

btnViewCards.addEventListener('click', () => {
    viewMode = 'cards';
    aplicarModoVisualizacao();
});


btnViewTable.addEventListener('click', () => {
    viewMode = 'table';
    aplicarModoVisualizacao();
});


window.toggleTarefa = toggleTarefa;
window.excluirTarefa = excluirTarefa;

window.addEventListener('DOMContentLoaded', async () => {
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }

    await carregarPerfil();
    await carregarTarefas();
});
