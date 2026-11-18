# Parte 1 · Lucas

Responsabilidade de revisão: conta, perfil, configurações e integração da aplicação.

| Requisito | Tela/ação |
| --- | --- |
| Splash e três slides | `/splash`, `/boas-vindas` |
| Cadastro, contato, aceite e senha em tempo real | `/cadastro`; checkbox e requisitos desbloqueiam o botão |
| Conflito de cadastro | Seletor “Conflito · 409” ou contato já cadastrado |
| Código com 15 min e três tentativas | `/verificar`; código demonstrativo `123456` |
| Login e erro de credenciais | `/login`; mostrar/ocultar senha |
| Recuperação em cinco telas | `/recuperar` → `/recuperar/enviado` → `/nova-senha` → `/senha-atualizada`; estado expirado em nova senha |
| Senha igual à atual | Tentar `Hydro@2026` na nova senha |
| Menu Mais | `/mais` |
| Perfil e foto local | `/perfil`; imagem até 2 MB |
| Compartilhar e remover | `/compartilhar`; modal de nome, e-mail e permissão |
| Acessibilidade | `/acessibilidade`; fontes, contraste, tema, animações, anúncios e legendas |
| Avaliação | `/avaliar` → `/avaliar/obrigado` |

O app não armazena senhas. Autenticação e recuperação são fluxos de interface, sem servidor. A semântica de leitores de tela está sempre presente; a preferência registra a configuração demonstrativa. O alto contraste e o tema devem ser revisados em conjunto com usuário real antes de uso em produção.

Validação desta parte: `node --test tests/account.test.mjs tests/integration.test.mjs`. Fluxo principal no navegador: cadastro → código errado → código correto → login.

Dependência de integração: `app.js` importa os seis módulos. Por isso o primeiro commit contém a base, mas o projeto completo deve ser executado depois dos seis commits. A divisão prioriza arquivos sem sobreposição; os commits iniciais não são entregas isoladas executáveis.
