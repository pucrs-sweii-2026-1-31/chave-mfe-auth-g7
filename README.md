# chave-mfe-auth

Microfrontend de autenticação do projeto **Chave**.

Responsável pelo fluxo de login, cadastro e dashboard do usuário autenticado. Expõe três componentes via **Module Federation** para serem consumidos pelo `chave-shell`.

---

## Tecnologias

| Tecnologia | Versão |
|---|---|
| React | 18 |
| TypeScript | 5 |
| Vite | 5 |
| Material UI (MUI) | 9 |
| `@originjs/vite-plugin-federation` | 1.3 |

---

## Páginas

### `LoginPage`

Tela de autenticação do usuário.

- Campos: e-mail e senha (com toggle de visibilidade)
- Chama `POST /api/auth/login` no `chave-ms-auth`
- Salva o JWT retornado em `localStorage` sob a chave `token`
- Exibe erro via `Alert` do MUI em caso de credenciais inválidas
- Redireciona para o `DashboardPage` após autenticação bem-sucedida
- Link para navegar ao `SignUpPage`

**Props:**

| Prop | Tipo | Descrição |
|---|---|---|
| `onLogin` | `(data) => void` | Chamado após login bem-sucedido |
| `onGoToSignUp` | `() => void` | Navega para a tela de cadastro |

---

### `SignUpPage`

Tela de cadastro de novo usuário.

- Campos: nome, data de nascimento, gênero (Masculino / Feminino / Indefinido), e-mail, senha e confirmação de senha
- Validação em tempo real: regras de senha (mínimo 10 chars, maiúscula, número, especial), formato de e-mail, senhas coincidentes
- Chama `POST /api/users/sign-up` no `chave-ms-auth`
- Exibe sucesso via `Snackbar` e redireciona para o `LoginPage`
- Link para navegar ao `LoginPage`

**Props:**

| Prop | Tipo | Descrição |
|---|---|---|
| `onSignUp` | `(data) => void` | Chamado após cadastro bem-sucedido |
| `onGoToLogin` | `() => void` | Navega para a tela de login |

---

### `DashboardPage`

Tela principal pós-autenticação.

- Busca os dados do usuário logado em `GET /api/auth/me`
- Exibe perfil: nome, e-mail, idade, gênero e perfis (roles) como chips
- Se o token estiver expirado (resposta 401), remove o token e redireciona para o login automaticamente
- Botão de logout: chama `POST /api/auth/logout` e remove o token do `localStorage`

**Funcionalidades exclusivas para administradores:**

- Lista todos os usuários do sistema via `GET /api/users/all`
- Tabela com: nome, e-mail, idade calculada, roles e ações
- **Tornar admin**: concede privilégios de administrador a um usuário via `PUT /api/users/copy-roles`
- **Remover admin**: reverte um usuário administrador para perfil padrão via `PUT /api/users/downgrade-roles`
- O próprio usuário logado não possui botão de ação (protegido na interface)

> Um usuário é considerado administrador quando possui uma role com `idRole === 2`.

**Props:**

| Prop | Tipo | Descrição |
|---|---|---|
| `onLogout` | `() => void` | Chamado após logout |

---

## Sessão

O token JWT é armazenado em `localStorage` sob a chave `token`. Ao carregar a aplicação, se o token já existir, o usuário é direcionado diretamente ao `DashboardPage` sem precisar fazer login novamente.

**Fluxo de navegação:**

```
login ──► dashboard
  ▲           │ (logout)
  │           ▼
signup ◄──► login
```

---

## Module Federation

Este microfrontend atua como **remote** na arquitetura Module Federation:

| Propriedade | Valor |
|---|---|
| Nome | `mfe_auth` |
| Entry point | `http://localhost:4001/assets/remoteEntry.js` |
| Shared | `react`, `react-dom` |

**Componentes expostos:**

| Módulo | Arquivo |
|---|---|
| `./LoginPage` | `src/pages/LoginPage.tsx` |
| `./SignUpPage` | `src/pages/SignUpPage.tsx` |
| `./DashboardPage` | `src/pages/DashboardPage.tsx` |

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_MS_AUTH_URL` | `http://localhost:3001` | URL base do `chave-ms-auth` |

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia em modo desenvolvimento na porta 4001 |
| `npm run build` | Gera o bundle de produção em `dist/` |
| `npm run preview` | Serve o build gerado na porta 4001 |

---

## Desenvolvimento local (sem Docker)

```bash
npm install
npm run dev
```

Acesse: http://localhost:4001

> O `chave-ms-auth` precisa estar em execução para que as chamadas de API funcionem.

---

## Executando com a stack completa

Este serviço é orquestrado pelo `chave-infra` via Docker Compose. O container `chave-mfe-auth` sobe na porta `4001` (configurável via `MFE_AUTH_PORT`).

```bash
# Na pasta chave-infra
docker compose up
```

Consulte o [README do chave-infra](../chave-infra/README.md) para configuração completa da stack.
