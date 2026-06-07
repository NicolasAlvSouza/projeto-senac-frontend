const API_BASE = 'https://tarefas-carlos.vercel.app';
const TOKEN_KEY = 'acesso-carlos';

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

function setupTopbarAuth() {
    const nav = document.querySelector('.topbar-nav');
    if (!nav) return;

    const token = getToken();
    const links = Array.from(nav.querySelectorAll('.nav-link'));

    links.forEach((link) => {
        const href = (link.getAttribute('href') || '').trim();
        let show = false;

        if (token) {
            show = href === 'index.html' || href === 'perfil.html' || href === 'tarefas.html';
        } else {
            show = href === 'index.html' || href === 'login.html';
        }

        link.classList.toggle('is-hidden', !show);
    });

    const topbarLogout = document.getElementById('topbar-logout');
    if (topbarLogout) {
        if (token) {
            topbarLogout.classList.remove('is-hidden');
        } else {
            topbarLogout.classList.add('is-hidden');
        }
    }
}

function getResultadoArea() {
    return document.getElementById('resultado');
}

function mostrarResultado(texto, tipo = 'success') {
    const resultadoArea = getResultadoArea();
    if (!resultadoArea) {
        console.log(texto);
        return;
    }

    resultadoArea.textContent = texto;
    resultadoArea.className = tipo === 'success' ? 'alert success' : 'alert error';
}

function setupValidation(form) {
    if (!form) return;

    Array.from(form.elements).forEach(element => {
        if (!(element instanceof HTMLInputElement)) return;

        element.addEventListener('input', () => {
            element.setCustomValidity('');
        });

        element.addEventListener('invalid', () => {
            if (element.validity.valueMissing) {
                element.setCustomValidity('Este campo é obrigatório.');
            } else if (element.validity.typeMismatch) {
                element.setCustomValidity('Por favor, informe um valor válido.');
            } else {
                element.setCustomValidity('Valor inválido.');
            }
        });
    });
}

async function apiRequest(path, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };

    if (options.auth !== false && token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const resposta = await fetch(`${API_BASE}${path}`, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const textoResposta = await resposta.text();
    let dados;

    try {
        dados = JSON.parse(textoResposta);
    } catch (erro) {
        dados = { message: textoResposta };
    }

    if (!resposta.ok) {
        const mensagem = dados.message || `Erro ${resposta.status}`;
        throw new Error(mensagem);
    }

    return dados;
}

function logout(redirect = true) {
    clearToken();
    setupTopbarAuth();
    if (redirect) {
        window.location.href = 'login.html';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    setupTopbarAuth();

    const topbarLogout = document.getElementById('topbar-logout');
    if (topbarLogout) {
        topbarLogout.addEventListener('click', (event) => {
            event.preventDefault();
            logout(true);
        });
    }
});
