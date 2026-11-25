# 🇫🇷 Vive la France

## Sobre o projeto

O **Vive la France** é um projeto desenvolvido para apresentar conteúdos
sobre a França por meio de um site com identidade visual inspirada na
cultura francesa.

O sistema possui uma tela de login e cadastro, permitindo que os
usuários acessem suas contas e explorem o conteúdo disponibilizado.

## Objetivo

Desenvolver uma plataforma simples, intuitiva e visualmente organizada
que permita:

-   Criar contas de usuários.
-   Realizar login com e-mail e senha.
-   Controlar o acesso dos usuários.
-   Explorar conteúdos relacionados à França.
-   Alternar entre os temas claro e escuro.

## Integrantes e papéis

  Integrante           Papel
  -------------------- ------------------------------------------
  Hagatha Dreger,Maria Vitória, Walysson Vasconcelos, Caio Henrique, Anna Beatrz, Maria Eduarda Pereira  Desenvolvimento e organização do projeto
  Demais integrantes   A preencher, caso existam

> Atualize esta tabela com os nomes e as responsabilidades dos demais
> integrantes, se houver.

## Tecnologias utilizadas

-   **HTML5:** estrutura das páginas.
-   **CSS3:** estilos e identidade visual.
-   **JavaScript:** funcionalidades e interatividade.
-   **Firebase:** suporte à autenticação e aos serviços em nuvem,
    conforme a configuração do projeto.
-   **GitHub:** versionamento e hospedagem do código.
-   **Netlify:** publicação do site, caso esteja sendo utilizado.

## APIs e serviços utilizados

### Firebase Authentication

Pode ser utilizado para criar contas e autenticar usuários por e-mail e
senha.

### Firebase

O arquivo `config.js` reúne as configurações necessárias para conectar o
projeto aos serviços Firebase habilitados.

> A integração efetiva depende das configurações e dos serviços ativados
> no projeto. O modo local não equivale à autenticação segura em nuvem.

## Estrutura dos arquivos

``` text
Vive-la-France/
├── login.html
├── index.css
├── config.js
├── script.js
└── README.md
```

## Como executar o projeto

1.  Baixe ou clone o repositório.
2.  Abra a pasta do projeto no Visual Studio Code.
3.  Confira se os arquivos estão na mesma estrutura indicada acima.
4.  Se for utilizar o Firebase, configure o arquivo `config.js` com os
    dados do seu próprio projeto.
5.  Abra o arquivo `login.html` no navegador ou execute-o com a extensão
    Live Server do VS Code.
6.  Teste as funcionalidades de login, cadastro e alternância de tema.

## Capturas de tela

Adicione as imagens reais do projeto em uma pasta chamada `prints`, na
raiz do repositório.

### Tela de login

![Tela de login](prints/login.png)

### Tela de cadastro

![Tela de cadastro](prints/cadastro.png)

### Tema escuro

![Tema escuro](prints/tema-escuro.png)

> Os caminhos acima são exemplos. Inclua os arquivos de imagem
> correspondentes ou ajuste os nomes para corresponder às capturas que
> você adicionar.

## Site publicado

**Link:** [Adicione aqui o endereço do site
publicado](INSIRA_AQUI_O_LINK_DO_SITE)

> Substitua o endereço de exemplo pelo link público correto do projeto.

## Segurança

-   Utilize Firebase Authentication para autenticação real em nuvem.
-   Não armazene senhas diretamente no JavaScript ou no navegador.
-   Configure regras de segurança adequadas para os serviços Firebase
    utilizados.
-   Não publique credenciais administrativas, chaves privadas ou
    arquivos secretos.
-   Lembre-se de que uma chave de configuração do Firebase usada no
    frontend não substitui as regras de segurança do serviço.

## Conclusão

O projeto **Vive la France** busca unir tecnologia, educação e cultura,
oferecendo uma plataforma com identidade visual francesa e
funcionalidades de autenticação. O desenvolvimento utiliza HTML, CSS e
JavaScript, com possibilidade de integração ao Firebase para oferecer
recursos de acesso e cadastro de usuários.

