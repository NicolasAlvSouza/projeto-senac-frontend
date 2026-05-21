const formTarefa = document.getElementById('form-tarefa');
const perfilInfo = document.getElementById('perfil-info');
const listaTarefas = document.getElementById('lista-tarefas');
const btnLogout = document.getElementById('btn-logout');

setupValidation(formTarefa);

async function carregarPerfil() {
    try {
        const perfil = await apiRequest('/usuarios/perfil');

        if (perfilInfo) {
            perfilInfo.innerHTML = `
                <p><strong>ID:</strong> ${perfil.id}</p>
                <p><strong>Nome:</strong> ${perfil.nome}</p>
                <p><strong>E-mail:</strong> ${perfil.email}</p>
                <p><strong>Telefone:</strong> ${perfil.telefone}</p>
            `;
        }

        mostrarResultado('Perfil carregado com sucesso.');
    } catch (erro) {
        mostrarResultado(`Falha ao carregar perfil: ${erro.message}`, 'error');
        logout();
    }
}

async function carregarTarefas() {
    if (!listaTarefas) {
        return;
    }

    try {
        const tarefas = await apiRequest('/tarefas');
        listaTarefas.innerHTML = '';

        if (!tarefas.length) {
            listaTarefas.innerHTML = '<tr><td colspan="3">Nenhuma tarefa encontrada.</td></tr>';
            return;
        }

        tarefas.forEach(tarefa => {
            const linha = document.createElement('tr');
            linha.innerHTML = `
                <td>${tarefa.titulo}</td>
                <td>
                    <span class="status ${tarefa.concluida ? 'done' : 'pending'}">
                        ${tarefa.concluida ? 'Concluída' : 'Pendente'}
                    </span>
                </td>
                <td>
                    <button class="small" onclick="toggleTarefa(${tarefa.id}, ${tarefa.concluida}, ${JSON.stringify(tarefa.titulo).replace(/"/g, '&quot;')})">
                        ${tarefa.concluida ? 'Reabrir' : 'Concluir'}
                    </button>
                    <button class="small danger" onclick="excluirTarefa(${tarefa.id})">Excluir</button>
                </td>
            `;
            listaTarefas.appendChild(linha);
        });
    } catch (erro) {
        mostrarResultado(`Erro ao carregar tarefas: ${erro.message}`, 'error');
    }
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
