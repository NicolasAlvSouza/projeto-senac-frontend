const perfilInfo = document.getElementById('perfil-info');
const btnLogout = document.getElementById('btn-logout');

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

if (btnLogout) {
    btnLogout.addEventListener('click', () => logout(true));
}

window.addEventListener('DOMContentLoaded', async () => {
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }

    await carregarPerfil();
});
