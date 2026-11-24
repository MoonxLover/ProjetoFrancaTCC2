# ProjetoFrancaTCC2
# Changelog

## [1.0.0] - 24/11/2026

### Adicionado
- Configuração do sistema de login com Firebase.
- Opção de login no Modo Local.
- Opção de login no Modo Nuvem.
- Configuração da chave `firebaseApiKey`.
- Suporte à autenticação por e-mail e senha.

### Melhorado
- Organização das configurações de login.
- Facilidade para alternar entre Modo Local e Modo Nuvem.
- Orientações para configurar o Firebase Authentication.

### Segurança
- Orientação para restringir o uso da chave de API ao domínio do projeto.
- Recomendação de configuração adequada das regras de segurança.

### Observação
- Quando `firebaseApiKey` está vazio, o projeto utiliza o Modo Local, conforme a implementação.
- Para utilizar o Modo Nuvem, é necessário configurar o Firebase.

git add CHANGELOG.md
git commit -m "Adiciona changelog da configuração Firebase"
git push origin main
