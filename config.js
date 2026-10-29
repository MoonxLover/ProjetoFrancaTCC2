// ============================================
// Configuração do login na nuvem (opcional)
//
// Deixe firebaseApiKey vazio ("") para usar o MODO LOCAL:
//   as contas ficam salvas só no navegador de quem criou.
//
// Para o MODO NUVEM (a mesma conta funciona em qualquer aparelho):
//   1) Crie um projeto em https://console.firebase.google.com
//   2) Authentication > Sign-in method > ative "E-mail/senha"
//   3) Configurações do projeto > Geral > "Chave de API da Web"
//   4) Cole a chave abaixo, entre as aspas.
// A chave da Web do Firebase não é segredo (ela aparece no site de qualquer forma),
// mas restrinja o uso dela ao seu domínio no Google Cloud Console.
// ============================================
const VLF_CONFIG = {
    firebaseApiKey: ""
};