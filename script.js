// ============================================
// Vive la France - script.js
// Funcionalidades: Clima ao vivo + previsão de 7 dias, Conversor Euro/Real (dois sentidos),
// Modo claro/escuro e Carrossel de imagens do início
// APIs gratuitas, sem necessidade de chave (API key)
// ============================================

// ============================================
// Utilitários: cache de curta duração (evita chamar a API toda hora)
// ============================================
function lerCache(chave, validadeMs) {
    try {
        const bruto = sessionStorage.getItem(chave);
        if (!bruto) return null;
        const { t, dados } = JSON.parse(bruto);
        return Date.now() - t < validadeMs ? dados : null;
    } catch (e) {
        return null;
    }
}

function salvarCache(chave, dados) {
    try {
        sessionStorage.setItem(chave, JSON.stringify({ t: Date.now(), dados }));
    } catch (e) {
        // sem cache, segue normalmente
    }
}

function dataDoISO(dataISO) {
    // meio-dia evita que o fuso horário "volte" um dia
    return new Date(dataISO + "T12:00:00");
}

// ============================================
// Clima: condição atual + previsão de 7 dias (API Open-Meteo)
// ============================================
const cidades = {
    paris: { nome: "Paris", lat: 48.8566, lon: 2.3522 },
    nice: { nome: "Nice", lat: 43.7102, lon: 7.2620 },
    lyon: { nome: "Lyon", lat: 45.7640, lon: 4.8357 },
    marselha: { nome: "Marselha", lat: 43.2965, lon: 5.3698 },
    bordeaux: { nome: "Bordeaux", lat: 44.8378, lon: -0.5792 },
    estrasburgo: { nome: "Estrasburgo", lat: 48.5734, lon: 7.7521 }
};

// Códigos meteorológicos (padrão WMO) usados pela Open-Meteo
const climaCodigos = {
    0: { desc: "Céu limpo", icone: "☀️" },
    1: { desc: "Poucas nuvens", icone: "🌤️" },
    2: { desc: "Parcialmente nublado", icone: "⛅" },
    3: { desc: "Nublado", icone: "☁️" },
    45: { desc: "Nevoeiro", icone: "🌫️" },
    48: { desc: "Nevoeiro com gelo", icone: "🌫️" },
    51: { desc: "Garoa fraca", icone: "🌦️" },
    53: { desc: "Garoa moderada", icone: "🌦️" },
    55: { desc: "Garoa forte", icone: "🌧️" },
    56: { desc: "Garoa congelante fraca", icone: "🌧️" },
    57: { desc: "Garoa congelante forte", icone: "🌧️" },
    61: { desc: "Chuva fraca", icone: "🌧️" },
    63: { desc: "Chuva moderada", icone: "🌧️" },
    65: { desc: "Chuva forte", icone: "🌧️" },
    66: { desc: "Chuva congelante fraca", icone: "🌧️" },
    67: { desc: "Chuva congelante forte", icone: "🌧️" },
    71: { desc: "Neve fraca", icone: "🌨️" },
    73: { desc: "Neve moderada", icone: "❄️" },
    75: { desc: "Neve forte", icone: "❄️" },
    77: { desc: "Grãos de neve", icone: "❄️" },
    80: { desc: "Pancadas de chuva", icone: "🌦️" },
    81: { desc: "Pancadas moderadas", icone: "🌧️" },
    82: { desc: "Pancadas fortes", icone: "⛈️" },
    85: { desc: "Pancadas de neve", icone: "🌨️" },
    86: { desc: "Pancadas fortes de neve", icone: "🌨️" },
    95: { desc: "Tempestade", icone: "⛈️" },
    96: { desc: "Tempestade com granizo", icone: "⛈️" },
    99: { desc: "Tempestade forte", icone: "⛈️" }
};

const CLIMA_CACHE_MS = 10 * 60 * 1000; // 10 minutos
let contadorBuscaClima = 0; // evita que uma resposta antiga sobrescreva a cidade atual

function infoClima(codigo) {
    return climaCodigos[codigo] || { desc: "Condição desconhecida", icone: "🌡️" };
}

function rotuloDia(dataISO, indice) {
    if (indice === 0) return "Hoje";
    if (indice === 1) return "Amanhã";
    const nome = dataDoISO(dataISO).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
    return nome.charAt(0).toUpperCase() + nome.slice(1);
}

// Busca condição atual + previsão diária (com tempo limite e cache)
async function obterClima(cidade) {
    const chave = "vlf-clima-" + cidade.nome;
    const emCache = lerCache(chave, CLIMA_CACHE_MS);
    if (emCache) return emCache;

    const url = "https://api.open-meteo.com/v1/forecast"
        + "?latitude=" + cidade.lat + "&longitude=" + cidade.lon
        + "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m"
        + "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
        + "&timezone=auto&forecast_days=7";

    const controle = new AbortController();
    const timer = setTimeout(() => controle.abort(), 10000);

    try {
        const response = await fetch(url, { signal: controle.signal });
        if (!response.ok) throw new Error("Falha na requisição do clima");

        const dados = await response.json();
        if (!dados.current || !dados.daily || !Array.isArray(dados.daily.time)) {
            throw new Error("Resposta inesperada da API de clima");
        }
        salvarCache(chave, dados);
        return dados;
    } finally {
        clearTimeout(timer);
    }
}

function renderClimaAtual(el, dados, cidade) {
    const atual = dados.current;
    const info = infoClima(atual.weather_code);

    el.innerHTML = `
        <div class="clima-info">
            <span class="clima-icone">${info.icone}</span>
            <div>
                <p class="clima-temp">${Math.round(atual.temperature_2m)}°C</p>
                <p class="clima-desc">${info.desc} em ${cidade.nome}</p>
                <p class="clima-vento">Sensação ${Math.round(atual.apparent_temperature)}°C · Umidade ${Math.round(atual.relative_humidity_2m)}% · Vento ${Math.round(atual.wind_speed_10m)} km/h</p>
            </div>
        </div>
    `;
}

function renderPrevisao(el, dados) {
    const d = dados.daily;

    const cartoes = d.time.map((dataISO, i) => {
        const info = infoClima(d.weather_code[i]);
        const chuvaBruta = d.precipitation_probability_max ? d.precipitation_probability_max[i] : null;
        const chuva = chuvaBruta === null || chuvaBruta === undefined ? "–" : Math.round(chuvaBruta) + "%";
        const data = dataDoISO(dataISO).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

        return `
            <div class="previsao-dia">
                <span class="previsao-nome">${rotuloDia(dataISO, i)}</span>
                <span class="previsao-data">${data}</span>
                <span class="previsao-icone" role="img" aria-label="${info.desc}" title="${info.desc}">${info.icone}</span>
                <span class="previsao-temp"><strong>${Math.round(d.temperature_2m_max[i])}°</strong> <span>${Math.round(d.temperature_2m_min[i])}°</span></span>
                <span class="previsao-chuva" title="Probabilidade de chuva">💧 ${chuva}</span>
            </div>
        `;
    }).join("");

    el.innerHTML = `
        <h4 class="previsao-titulo">Próximos ${d.time.length} dias</h4>
        <div class="previsao-grid">${cartoes}</div>
    `;
}

async function buscarClima(cidadeKey) {
    const resultadoEl = document.getElementById("clima-resultado");
    const previsaoEl = document.getElementById("clima-previsao");
    const cidade = cidades[cidadeKey];
    if (!resultadoEl || !cidade) return;

    const minhaBusca = ++contadorBuscaClima;
    resultadoEl.innerHTML = `<p class="loading-text">Buscando clima em ${cidade.nome}...</p>`;
    if (previsaoEl) previsaoEl.innerHTML = "";

    try {
        const dados = await obterClima(cidade);
        if (minhaBusca !== contadorBuscaClima) return; // o usuário já escolheu outra cidade
        renderClimaAtual(resultadoEl, dados, cidade);
        if (previsaoEl) renderPrevisao(previsaoEl, dados);
    } catch (erro) {
        if (minhaBusca !== contadorBuscaClima) return;
        console.error("Erro ao buscar clima:", erro);
        resultadoEl.innerHTML = `
            <p class="erro-text">Não foi possível carregar o clima agora.</p>
            <button type="button" class="btn-retry" id="clima-retry">Tentar novamente</button>
        `;
        document.getElementById("clima-retry").addEventListener("click", () => buscarClima(cidadeKey));
    }
}

// ============================================
// Conversor de moeda Euro ⇄ Real (API Frankfurter)
// ============================================
const direcoesConversor = {
    EUR_BRL: {
        base: "EUR",
        quote: "BRL",
        placeholder: "Valor em €"
    },
    BRL_EUR: {
        base: "BRL",
        quote: "EUR",
        placeholder: "Valor em R$"
    }
};

const COTACAO_CACHE_MS = 60 * 60 * 1000; // 1 hora

function formatarMoeda(valor, moeda, casasMin, casasMax) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: moeda,
        minimumFractionDigits: casasMin,
        maximumFractionDigits: casasMax
    }).format(valor);
}

// A v2 da Frankfurter devolve só a cotação em /rate/{base}/{quote};
// a multiplicação é feita aqui.
async function obterCotacao(base, quote) {
    const chave = "vlf-cotacao-" + base + "-" + quote;
    const emCache = lerCache(chave, COTACAO_CACHE_MS);
    if (emCache) return emCache;

    const response = await fetch("https://api.frankfurter.dev/v2/rate/" + base + "/" + quote);
    if (!response.ok) throw new Error("Falha na requisição da conversão");

    const dados = await response.json();
    if (!Number.isFinite(Number(dados.rate))) throw new Error("Cotação inválida");

    salvarCache(chave, dados);
    return dados;
}

async function converterMoeda() {
    const valorInput = document.getElementById("valor-euro");
    const resultadoEl = document.getElementById("conversor-resultado");
    const direcaoSelect = document.getElementById("conversor-direcao");
    const direcao = direcoesConversor[direcaoSelect ? direcaoSelect.value : "EUR_BRL"];

    const valor = parseFloat(valorInput.value);

    if (!valor || valor <= 0) {
        resultadoEl.innerHTML = `<p class="erro-text">Digite um valor válido.</p>`;
        return;
    }

    resultadoEl.innerHTML = `<p class="loading-text">Convertendo...</p>`;

    try {
        const cotacao = await obterCotacao(direcao.base, direcao.quote);
        const taxa = Number(cotacao.rate);
        const convertido = valor * taxa;
        const dataCotacao = cotacao.date
            ? dataDoISO(cotacao.date).toLocaleDateString("pt-BR")
            : "hoje";

        resultadoEl.innerHTML = `
            <p class="conversor-valor">${formatarMoeda(valor, direcao.base, 2, 2)} = <strong>${formatarMoeda(convertido, direcao.quote, 2, 2)}</strong></p>
            <p class="conversor-data">Cotação: ${formatarMoeda(1, direcao.base, 2, 2)} = ${formatarMoeda(taxa, direcao.quote, 2, 4)} · atualizada em ${dataCotacao}</p>
        `;
    } catch (erro) {
        resultadoEl.innerHTML = `<p class="erro-text">Não foi possível converter agora. Tente novamente.</p>`;
        console.error("Erro ao converter moeda:", erro);
    }
}

// Atualiza o placeholder do campo de valor de acordo com o sentido escolhido
function atualizarPlaceholderConversor() {
    const direcaoSelect = document.getElementById("conversor-direcao");
    const valorInput = document.getElementById("valor-euro");
    if (!direcaoSelect || !valorInput) return;

    valorInput.placeholder = direcoesConversor[direcaoSelect.value].placeholder;
}

// ============================================
// Modo claro/escuro
// ============================================
function initThemeToggle() {
    const root = document.documentElement;
    const btn = document.getElementById("theme-toggle");
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function getTemaPreferido() {
        const salvo = localStorage.getItem("vlf-theme");
        if (salvo) return salvo;
        return mediaQuery.matches ? "dark" : "light";
    }

    function aplicarTema(tema) {
        root.setAttribute("data-theme", tema);
        if (btn) {
            btn.setAttribute(
                "aria-label",
                tema === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
            );
        }
    }

    // O tema já foi aplicado de forma inline no <head> para evitar flash;
    // aqui apenas garantimos que está sincronizado e ligamos os eventos.
    aplicarTema(getTemaPreferido());

    if (btn) {
        btn.addEventListener("click", () => {
            const atual = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
            const proximo = atual === "dark" ? "light" : "dark";
            localStorage.setItem("vlf-theme", proximo);
            aplicarTema(proximo);
        });
    }

    // Se o usuário nunca escolheu manualmente, acompanha mudanças do sistema
    mediaQuery.addEventListener("change", (e) => {
        if (!localStorage.getItem("vlf-theme")) {
            aplicarTema(e.matches ? "dark" : "light");
        }
    });
}

// ============================================
// Carrossel de imagens de fundo do início
// ============================================
function initHeroCarousel() {
    const slides = document.querySelectorAll(".hero-bg-slide");
    if (slides.length < 2) return;

    let indiceAtual = 0;

    setInterval(() => {
        slides[indiceAtual].classList.remove("active");
        indiceAtual = (indiceAtual + 1) % slides.length;
        slides[indiceAtual].classList.add("active");
    }, 6000);
}

// Inicializa os eventos assim que a página carrega
document.addEventListener("DOMContentLoaded", () => {
    const seletorCidade = document.getElementById("cidade-select");
    const botaoConverter = document.getElementById("converter-btn");
    const inputValor = document.getElementById("valor-euro");
    const direcaoSelect = document.getElementById("conversor-direcao");

    if (seletorCidade) {
        buscarClima(seletorCidade.value);
        seletorCidade.addEventListener("change", (e) => buscarClima(e.target.value));
    }

    if (botaoConverter) {
        botaoConverter.addEventListener("click", converterMoeda);
    }

    if (inputValor) {
        inputValor.addEventListener("keydown", (e) => {
            if (e.key === "Enter") converterMoeda();
        });
    }

    if (direcaoSelect) {
        atualizarPlaceholderConversor();
        direcaoSelect.addEventListener("change", () => {
            atualizarPlaceholderConversor();
            document.getElementById("conversor-resultado").innerHTML = "";
        });
    }

    initThemeToggle();
    initHeroCarousel();
});

// ============================================
// Login e cadastro (simulado no navegador)
// ATENÇÃO: os dados ficam no localStorage deste navegador. Serve para
// demonstração/TCC, mas NÃO é seguro para dados reais. Para um login de
// verdade, use um serviço como Firebase Auth ou Supabase Auth.
// ============================================
const AUTH_USERS_KEY = "vlf-users";
const AUTH_SESSION_KEY = "vlf-session";

function lerJSON(chave, padrao) {
    try {
        const bruto = localStorage.getItem(chave);
        return bruto ? JSON.parse(bruto) : padrao;
    } catch (e) {
        return padrao;
    }
}

// Grava no localStorage sem quebrar caso o navegador bloqueie o armazenamento
function gravar(chave, valor) {
    try {
        localStorage.setItem(chave, valor);
        return true;
    } catch (e) {
        return false;
    }
}

const MSG_SEM_STORAGE = "Seu navegador está bloqueando o armazenamento local (modo anônimo ou cookies desativados), então não dá para salvar a conta.";

// Executa uma ação e devolve uma mensagem amigável se algo inesperado acontecer
async function tentar(acao) {
    try {
        return await acao();
    } catch (e) {
        console.error(e);
        return { ok: false, msg: "Algo deu errado ao processar. Tente novamente." };
    }
}

function getUsuarios() {
    return lerJSON(AUTH_USERS_KEY, []);
}

function getSessao() {
    return lerJSON(AUTH_SESSION_KEY, null);
}

// Gera um hash da senha (SHA-256) para não guardá-la em texto puro
async function hashSenha(senha) {
    if (window.crypto && window.crypto.subtle) {
        const dados = new TextEncoder().encode(senha);
        const buffer = await crypto.subtle.digest("SHA-256", dados);
        return Array.from(new Uint8Array(buffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }
    // Alternativa simples caso o navegador não ofereça crypto.subtle
    let h = 5381;
    for (let i = 0; i < senha.length; i++) {
        h = ((h << 5) + h + senha.charCodeAt(i)) >>> 0;
    }
    return "d" + h.toString(16);
}

// ---------- Qual modo está ativo? ----------
// Modo nuvem = existe uma chave do Firebase em config.js (contas valem em qualquer aparelho)
// Modo local = sem chave (contas ficam salvas só neste navegador)
function getFirebaseKey() {
    if (typeof VLF_CONFIG === "undefined" || !VLF_CONFIG || !VLF_CONFIG.firebaseApiKey) return "";
    return String(VLF_CONFIG.firebaseApiKey).trim();
}

function modoNuvem() {
    return getFirebaseKey() !== "";
}

// ---------- Modo local ----------
async function cadastrarLocal(nome, email, senha) {
    const emailNorm = email.trim().toLowerCase();
    const usuarios = getUsuarios();

    if (usuarios.some((u) => u.email === emailNorm)) {
        return { ok: false, msg: "Já existe uma conta com esse e-mail. Use a aba “Entrar”." };
    }

    const hash = await hashSenha(senha);
    usuarios.push({ nome: nome.trim(), email: emailNorm, hash });

    const salvouUsuarios = gravar(AUTH_USERS_KEY, JSON.stringify(usuarios));
    const salvouSessao = gravar(AUTH_SESSION_KEY, JSON.stringify({ nome: nome.trim(), email: emailNorm }));
    if (!salvouUsuarios || !salvouSessao) {
        return { ok: false, msg: MSG_SEM_STORAGE };
    }
    return { ok: true };
}

async function entrarLocal(email, senha) {
    const emailNorm = email.trim().toLowerCase();
    const hash = await hashSenha(senha);
    const usuario = getUsuarios().find((u) => u.email === emailNorm);

    if (!usuario) {
        return {
            ok: false,
            msg: "Não há conta com esse e-mail neste navegador. As contas ficam salvas por navegador e por endereço do site: se você criou em outro aparelho ou em outro endereço, crie de novo na aba “Criar conta”."
        };
    }
    if (usuario.hash !== hash) {
        return { ok: false, msg: "Senha incorreta." };
    }

    if (!gravar(AUTH_SESSION_KEY, JSON.stringify({ nome: usuario.nome, email: usuario.email }))) {
        return { ok: false, msg: MSG_SEM_STORAGE };
    }
    return { ok: true };
}

// ---------- Modo nuvem (Firebase Authentication, via API REST) ----------
const FIREBASE_AUTH_URL = "https://identitytoolkit.googleapis.com/v1/accounts:";

async function chamarFirebase(acao, corpo) {
    const resposta = await fetch(FIREBASE_AUTH_URL + acao + "?key=" + encodeURIComponent(getFirebaseKey()), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo)
    });
    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        const texto = (dados.error && dados.error.message) || "ERRO_DESCONHECIDO";
        const erro = new Error(texto);
        erro.codigoFirebase = /API key/i.test(texto) ? "API_KEY_INVALID" : texto.split(" ")[0];
        throw erro;
    }
    return dados;
}

function mensagemErroFirebase(codigo) {
    const mensagens = {
        EMAIL_EXISTS: "Já existe uma conta com esse e-mail. Use a aba “Entrar”.",
        INVALID_LOGIN_CREDENTIALS: "E-mail ou senha incorretos.",
        INVALID_PASSWORD: "E-mail ou senha incorretos.",
        EMAIL_NOT_FOUND: "E-mail ou senha incorretos. Se ainda não tem conta, use a aba “Criar conta”.",
        INVALID_EMAIL: "Digite um e-mail válido.",
        WEAK_PASSWORD: "A senha é muito fraca. Use pelo menos 6 caracteres.",
        USER_DISABLED: "Esta conta foi desativada.",
        TOO_MANY_ATTEMPTS_TRY_LATER: "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
        OPERATION_NOT_ALLOWED: "O login por e-mail e senha não está ativado no Firebase (Authentication > Sign-in method).",
        API_KEY_INVALID: "A chave do Firebase em config.js é inválida.",
        REDE: "Sem conexão com o servidor. Verifique sua internet e tente de novo."
    };
    return mensagens[codigo] || "Não foi possível concluir agora. Tente novamente.";
}

function erroDeFirebase(e) {
    // fetch lança TypeError quando não há rede
    const codigo = e && e.codigoFirebase ? e.codigoFirebase : (e instanceof TypeError ? "REDE" : "ERRO_DESCONHECIDO");
    return { ok: false, msg: mensagemErroFirebase(codigo) };
}

async function cadastrarNuvem(nome, email, senha) {
    const emailNorm = email.trim().toLowerCase();
    try {
        const conta = await chamarFirebase("signUp", { email: emailNorm, password: senha, returnSecureToken: true });

        // guarda o nome na conta (se falhar, o cadastro continua valendo)
        try {
            await chamarFirebase("update", { idToken: conta.idToken, displayName: nome.trim(), returnSecureToken: false });
        } catch (e) {
            console.warn("Não foi possível salvar o nome na conta:", e);
        }

        if (!gravar(AUTH_SESSION_KEY, JSON.stringify({ nome: nome.trim(), email: emailNorm, uid: conta.localId }))) {
            return { ok: false, msg: MSG_SEM_STORAGE };
        }
        return { ok: true };
    } catch (e) {
        return erroDeFirebase(e);
    }
}

async function entrarNuvem(email, senha) {
    const emailNorm = email.trim().toLowerCase();
    try {
        const conta = await chamarFirebase("signInWithPassword", { email: emailNorm, password: senha, returnSecureToken: true });
        const nome = conta.displayName || emailNorm.split("@")[0];

        if (!gravar(AUTH_SESSION_KEY, JSON.stringify({ nome, email: emailNorm, uid: conta.localId }))) {
            return { ok: false, msg: MSG_SEM_STORAGE };
        }
        return { ok: true };
    } catch (e) {
        return erroDeFirebase(e);
    }
}

// ---------- Funções usadas pela tela de login ----------
async function cadastrarUsuario(nome, email, senha) {
    return modoNuvem() ? cadastrarNuvem(nome, email, senha) : cadastrarLocal(nome, email, senha);
}

async function entrarUsuario(email, senha) {
    return modoNuvem() ? entrarNuvem(email, senha) : entrarLocal(email, senha);
}

function sairDaConta() {
    localStorage.removeItem(AUTH_SESSION_KEY);
}

// Troca "Entrar" por "Sair (Nome)" no menu quando houver sessão ativa
function atualizarNavAuth() {
    const item = document.getElementById("nav-auth");
    if (!item) return;

    const sessao = getSessao();
    const estavaAtivo = item.querySelector("a.ativo") !== null;
    item.textContent = "";

    const link = document.createElement("a");
    if (sessao) {
        link.href = "#";
        link.textContent = "Sair (" + sessao.nome.split(" ")[0] + ")";
        link.addEventListener("click", (e) => {
            e.preventDefault();
            sairDaConta();
            window.location.reload();
        });
    } else {
        link.href = "login.html";
        link.textContent = "Entrar";
        if (estavaAtivo) link.className = "ativo";
    }
    item.appendChild(link);
}

function mostrarMensagem(el, texto, sucesso) {
    if (!el) return;
    el.textContent = texto;
    el.classList.toggle("ok", !!sucesso);
}

function initLogin() {
    const formLogin = document.getElementById("login-form");
    const formCadastro = document.getElementById("cadastro-form");
    if (!formLogin || !formCadastro) return;

    const abaEntrar = document.getElementById("tab-entrar");
    const abaCadastro = document.getElementById("tab-cadastro");
    const blocoForms = document.getElementById("login-forms");
    const blocoLogado = document.getElementById("login-logged");
    const msgLogin = document.getElementById("login-msg");
    const msgCadastro = document.getElementById("cadastro-msg");

    // Explica ao usuário onde a conta fica guardada
    const notaModo = document.getElementById("login-modo");
    if (notaModo) {
        notaModo.textContent = modoNuvem()
            ? "Sua conta fica salva na nuvem: funciona em qualquer aparelho."
            : "Modo local: as contas ficam salvas só neste navegador e neste endereço do site.";
    }

    // Pede ao navegador para não apagar os dados do site por conta própria
    if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
    }

    function mostrarAba(aba) {
        const entrar = aba === "entrar";
        formLogin.hidden = !entrar;
        formCadastro.hidden = entrar;
        abaEntrar.classList.toggle("active", entrar);
        abaCadastro.classList.toggle("active", !entrar);
        abaEntrar.setAttribute("aria-selected", String(entrar));
        abaCadastro.setAttribute("aria-selected", String(!entrar));
        mostrarMensagem(msgLogin, "");
        mostrarMensagem(msgCadastro, "");
    }

    abaEntrar.addEventListener("click", () => mostrarAba("entrar"));
    abaCadastro.addEventListener("click", () => mostrarAba("cadastro"));

    // Botões de mostrar/ocultar senha
    document.querySelectorAll(".senha-toggle").forEach((btn) => {
        btn.addEventListener("click", () => {
            const campo = document.getElementById(btn.dataset.alvo);
            if (!campo) return;
            const mostrando = campo.type === "text";
            campo.type = mostrando ? "password" : "text";
            btn.setAttribute("aria-label", mostrando ? "Mostrar senha" : "Ocultar senha");
        });
    });

    // Se já estiver logado, mostra o painel de boas-vindas
    const sessao = getSessao();
    if (sessao) {
        blocoForms.hidden = true;
        blocoLogado.hidden = false;
        document.getElementById("login-logged-nome").textContent = sessao.nome;
        document.getElementById("login-sair").addEventListener("click", () => {
            sairDaConta();
            window.location.reload();
        });
    }

    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const senha = document.getElementById("login-senha").value;

        if (!email.includes("@") || !senha) {
            mostrarMensagem(msgLogin, "Preencha o e-mail e a senha.");
            return;
        }

        const resultado = await tentar(() => entrarUsuario(email, senha));
        if (!resultado.ok) {
            mostrarMensagem(msgLogin, resultado.msg);
            return;
        }
        mostrarMensagem(msgLogin, "Login realizado! Redirecionando...", true);
        atualizarNavAuth();
        setTimeout(() => { window.location.href = "index.html"; }, 800);
    });

    formCadastro.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nome = document.getElementById("cad-nome").value;
        const email = document.getElementById("cad-email").value;
        const senha = document.getElementById("cad-senha").value;
        const senha2 = document.getElementById("cad-senha2").value;

        if (nome.trim().length < 2) {
            mostrarMensagem(msgCadastro, "Digite seu nome.");
            return;
        }
        if (!email.includes("@") || !email.includes(".")) {
            mostrarMensagem(msgCadastro, "Digite um e-mail válido.");
            return;
        }
        if (senha.length < 6) {
            mostrarMensagem(msgCadastro, "A senha precisa ter pelo menos 6 caracteres.");
            return;
        }
        if (senha !== senha2) {
            mostrarMensagem(msgCadastro, "As senhas não são iguais.");
            return;
        }

        const resultado = await tentar(() => cadastrarUsuario(nome, email, senha));
        if (!resultado.ok) {
            mostrarMensagem(msgCadastro, resultado.msg);
            return;
        }
        mostrarMensagem(msgCadastro, "Conta criada! Redirecionando...", true);
        atualizarNavAuth();
        setTimeout(() => { window.location.href = "index.html"; }, 800);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    atualizarNavAuth();
    initLogin();
});