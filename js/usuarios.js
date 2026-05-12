const API_URL = 'http://localhost:3000/usuarios';

const formUsuario = document.getElementById('form-usuario');
const listaUsuarios = document.getElementById('lista-usuarios');
const btnSalvar = document.getElementById('btn-salvar');
const btnCancelar = document.getElementById('btn-cancelar');
const inputId = document.getElementById('usuario-id');

// 1. Carregar Lista (GET)
async function carregarUsuarios() {
    const resposta = await fetch(API_URL);
    const usuarios = await resposta.json();
    listaUsuarios.innerHTML = '';

    usuarios.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.nome}</td>
            <td>${user.email}</td>
            <td>${user.telefone}</td>
            <td>
                <button onclick="prepararEdicao(${JSON.stringify(user).replace(/"/g, '&quot;')})">Editar</button>
                <button onclick="deletarUsuario(${user.id})">Excluir</button>
            </td>
        `;
        listaUsuarios.appendChild(tr);
    });
}

// 2. Preparar Edição (Preencher o formulário)
function prepararEdicao(usuario) {
    inputId.value = usuario.id;
    document.getElementById('nome').value = usuario.nome;
    document.getElementById('email').value = usuario.email;
    document.getElementById('telefone').value = usuario.telefone;
    document.getElementById('senha').value = usuario.senha;

    btnSalvar.textContent = 'Atualizar Usuário';
    btnCancelar.style.display = 'inline';
}

// 3. Cancelar Edição
btnCancelar.addEventListener('click', () => {
    formUsuario.reset();
    inputId.value = '';
    btnSalvar.textContent = 'Salvar Usuário';
    btnCancelar.style.display = 'none';
});

// 4. Salvar ou Atualizar (POST ou PUT)
formUsuario.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = inputId.value;
    const payload = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        senha: document.getElementById('senha').value
    };

    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const resposta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (resposta.ok) {
            alert(id ? 'Atualizado!' : 'Cadastrado!');
            btnCancelar.click(); // Reseta o form e o estado
            carregarUsuarios();
        }
    } catch (erro) {
        console.error('Erro na operação:', erro);
    }
});

// 5. Excluir (DELETE)
async function deletarUsuario(id) {
    if (!confirm('Excluir este usuário?')) return;

    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    carregarUsuarios();
}

window.addEventListener('DOMContentLoaded', carregarUsuarios);
