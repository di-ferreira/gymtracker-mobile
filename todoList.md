# GymTracker Mobile — Plano de Implementação

## Status do Projeto (Atualizado)

**Repositório:** `gymtracker-mobile`

**Arquivos existentes:**
| Arquivo | Status | Descrição |
|---|---|---|
| `.ai/` (3 subpastas) | ✅ Committed com modificações não stageadas | Documentos de planejamento (arquitetura, regras de negócio, requisitos) |
| `design-system/` | 🆕 Untracked | Design system completo em HTML/CSS (16 páginas) — fonte de verdade visual |
| `tokens.ts` | ✅ Committed | Design tokens iniciais (cores) |
| `types.md` | 🆕 Untracked | Tipos TypeScript completos para API e banco de dados |
| `todoList.md` | 🆕 Untracked | Este arquivo |
| `PROMPT.md` | ✅ Committed | Prompt original do projeto |
| `README.md` | ✅ Committed | README do projeto |

**Observação:** Nenhum `package.json`, `src/`, `app/` ou código-fonte existe ainda.

---

## Design System (design-system/) — Fonte de Verdade Visual

A pasta `design-system/` contém um design system exportado em HTML/CSS com especificações precisas:

| Arquivo | Conteúdo |
|---|---|
| `css/foundation.css` | Tokens CSS: cores, tipografia, spacing, elevation, radius, motion |
| `colors.html` | Paleta completa (11 cores + variantes) |
| `typography.html` | Escala tipográfica (8 tamanhos) |
| `spacing.html` | Grid de 4px (0–80px) |
| `elevation.html` | 5 níveis de sombra |
| `radius.html` | 7 níveis de border-radius |
| `iconography.html` | Guia de ícones |
| `motion.html` | Timing curves (5 durações, 5 easings) |
| `components-buttons.html` | Botões: primary, secondary, ghost, outline, icon |
| `components-inputs.html` | Input fields, labels, validation states |
| `components-cards.html` | Cards: default, interactive, highlight |
| `components-chips.html` | Chips: default, selected, filter |
| `components-drawers.html` | Drawers: left, right, bottom sheet |
| `components-navigation.html` | Nav: sidebar, tabs, bottom nav |
| `components-selects.html` | Select: dropdown, pills, filter group |
| `components-tables.html` | Tables: data, spec |
| `index.html` | Overview / launcher do design system |
| `DESIGN-HANDOFF.md` | Contrato de implementação (102 regras) |
| `DESIGN-MANIFEST.json` | Mapa machine-readable do design system |

> **Tokens extraídos do `foundation.css` (usar como fonte de verdade):**
> - Cores: `--gt-primary: #FF7A1A`, `--gt-bg: #0A0A0A`, `--gt-surface: #151515`, etc.
> - Superfícies: 4 níveis (`#151515` → `#2D2D2D`)
> - Texto: 4 níveis (branco → cinza #555)
> - Semânticas: success `#22C55E`, warning `#F59E0B`, error `#EF4444`, info `#3B82F6`
> - Font: Inter (body/display), JetBrains Mono (mono)
> - Radius: xs `4px` → full `9999px`
> - Spacing: 0 `0px` → 20 `80px` (base 4)
> - Elevation: 5 níveis de sombra
> - Motion: 5 durações (0–500ms), 5 easings (standard, decelerate, accelerate, spring, sharp)

---

## Mudanças Recentes (Business Rules & Requisitos)

Os arquivos `.ai/product/business-rules.md` e `.ai/product/requirements.md` foram atualizados com mudanças significativas:

| ID | Antes | Depois |
|---|---|---|
| **BR006** | Exercícios favoritos devem permanecer offline | Exercícios favoritos **ou exercícios do treino do usuário** devem ser acessados **online e offline** |
| **BR007** | Catálogo local atualizado apenas quando existir nova versão (global) | Catálogo local atualizado quando existir nova versão **do treino do usuário** |
| **BR008** | Substituições são fornecidas pela API | Substituições offline **somente de exercícios existentes no treino do usuário** |
| **BR009** | Sem login obrigatório. Todos os dados pertencem ao dispositivo | **Login obrigatório** somente no primeiro acesso. Usuário cadastrado na plataforma, dados ficam disponíveis offline |
| **RF006** | Consultar catálogo offline | Consultar **treinos e exercícios dos treinos** offline |
| **RF007** | Atualizar catálogo quando houver internet | Atualizar **exercícios** quando houver internet |
| **Offline** | Abrir qualquer exercício sem internet | Abrir qualquer exercício **do usuário** sem internet |

**Impacto arquitetural:**
- App agora tem **autenticação obrigatória** (register/login) no primeiro acesso
- Dados são **por usuário** (sync com cloud) e ficam disponíveis offline após login inicial
- Catálogo local é o **conjunto de dados do usuário** (workouts, history, progress), não um catálogo global
- Sync service precisa lidar com **dados do usuário** (workouts, exercícios do treino, progresso)

---

## Plano de Implementação em 10 Fases

### Fase 1 — Scaffolding do Projeto ✅

- [x] Inicializar Expo com TypeScript (`npx create-expo-app@latest --template blank-typescript`)
- [x] Configurar Expo Router (`npx expo install expo-router`)
- [x] Configurar `app.json` com scheme, plugins e orientação
- [x] Configurar `tsconfig.json` com paths absolutos (`@/` → `src/`)
- [x] Configurar `babel.config.js` com plugins do Reanimated e Expo Router
- [x] Instalar dependências principais:
  - `zustand` — estado global
  - `@tanstack/react-query` — server state / cache
  - `expo-sqlite` — banco local
  - `react-native-mmkv` — armazenamento rápido
  - `react-hook-form` + `zod` + `@hookform/resolvers` — formulários
  - `react-native-reanimated` — animações
  - `react-native-gesture-handler` — gestos
  - `@shopify/flashlist` — listas performáticas
  - `axios` — HTTP client
  - `expo-router` + `expo-linking` + `expo-constants`
- [x] Configurar ESLint + Prettier
- [x] Criar estrutura de pastas:

```
src/
├── app/                    # Expo Router pages
│   ├── (tabs)/             # Abas principais
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # Home
│   │   ├── exercises.tsx   # Catálogo
│   │   ├── favorites.tsx   # Favoritos
│   │   ├── workouts.tsx    # Workouts
│   │   └── settings.tsx    # Configurações
│   ├── _layout.tsx         # Layout raiz
│   ├── login.tsx           # Tela de login
│   ├── register.tsx        # Tela de registro
│   ├── onboarding.tsx
│   └── exercise/[id].tsx
├── features/
│   ├── auth/               # 🔒 Novo: autenticação
│   ├── exercises/
│   ├── favorites/
│   ├── workouts/
│   ├── history/
│   ├── progress/
│   └── settings/
├── components/ui/
├── database/
├── services/
├── storage/
├── hooks/
├── providers/
├── constants/
├── types/
└── theme/
```

---

### Fase 2 — Camada de Fundamentos ✅

#### Types
- [x] Extrair interfaces de `types.md` para `src/types/`:
  - `user.ts` — User, RegisterRequest, LoginRequest, TokenResponse
  - `exercise.ts` — Exercise, ExerciseCreate, ExerciseUpdate, ExerciseEquipment, ExerciseInstruction, ExerciseAlternative
  - `muscle-group.ts` — MuscleGroup, MuscleGroupCreate, MuscleGroupUpdate
  - `movement-group.ts` — MovementGroup, MovementGroupCreate, MovementGroupUpdate
  - `equipment.ts` — Equipment, EquipmentCreate, EquipmentUpdate
  - `catalog.ts` — CatalogVersion
  - `workout.ts` — Workout, WorkoutExercise, WorkoutHistory, ExerciseProgress
- [x] Criar barrel exports (`index.ts`) para `src/types/`

#### Theme / Design System
- [x] Referência principal: `design-system/css/foundation.css` — fonte de verdade
- [x] `src/theme/colors.ts` — `--gt-*` tokens (primary, bg, surface, fg, semantic, border)
- [x] `src/theme/typography.ts` — fontFamily (Inter), fontSize scale (40→11), weights, letterSpacing
- [x] `src/theme/spacing.ts` — `--gt-space-*` (0–80px, base 4)
- [x] `src/theme/borderRadius.ts` — `--gt-radius-*` (xs→full)
- [x] `src/theme/shadows.ts` — `--gt-elevation-*` (0–4), adaptado iOS + Android
- [x] `src/theme/motion.ts` — `--gt-duration-*` + `--gt-ease-*` → Reanimated configs
- [x] `src/theme/index.ts` — export unificado

#### Database
- [x] `src/database/schema.ts` — CREATE TABLE para 11 tabelas (users, exercises, muscle_groups, movement_groups, equipments, exercise_equipments, exercise_instructions, exercise_alternatives, workouts, workout_exercises, workout_history, exercise_progress, catalog_versions)
- [x] `src/database/migrations.ts` — sistema de migration incremental com `_migrations` table
- [x] `src/database/repositories/`: exercise, workout, history, catalog, user repositories
- [x] `src/database/index.ts` — initDatabase(), getDatabase(), closeDatabase()

#### Storage (MMKV)
- [x] `src/storage/auth-storage.ts` — JWT + refresh token (createMMKV)
- [x] `src/storage/favorites-storage.ts` — lista de IDs favoritados
- [x] `src/storage/preferences-storage.ts` — onboarding, weight unit, rest timer, theme
- [x] `src/storage/index.ts` — barrel export

#### Services (API)
- [x] `src/services/api.ts` — Axios instance com interceptors (token attach + refresh automático)
- [x] `src/services/auth-service.ts` — register, login, getMe, updateProfile, logout
- [x] `src/services/catalog-service.ts` — fetch exercises, muscle-groups, movement-groups, equipment
- [x] `src/services/sync-service.ts` — syncCatalog com version check + downloadAndStore
- [x] `src/services/admin-service.ts` — CRUD admin para users, exercises, muscle-groups, movement-groups, equipment
- [x] `src/services/index.ts` — barrel export

---

### Fase 3 — 🔒 Autenticação (NOVA — impacto BR009)

> **BR009**: Login obrigatório somente no primeiro acesso. Usuário cadastrado na plataforma, dados ficam disponíveis offline.

- [ ] **LoginScreen** (`src/app/login.tsx`):
  - Formulário: email + senha
  - Validação com Zod (react-hook-form)
  - Chamada `authService.login()`
  - Armazenar JWT + refresh token em MMKV
  - Redirect para Home após sucesso
- [ ] **RegisterScreen** (`src/app/register.tsx`):
  - Formulário: nome, email, senha, confirmar senha
  - Validação com Zod
  - Chamada `authService.register()`
  - Armazenar JWT + redirect após sucesso
- [ ] **AuthProvider** — contexto que verifica token existente ao abrir app
  - Se token válido → vai para tabs
  - Se sem token → vai para login
  - Se token expirado → tenta refresh, senão vai para login
- [ ] **Guard** no layout raiz — proteger rotas authenticated-only
- [ ] **Token refresh interceptor** — renovar JWT automaticamente via Axios interceptor
- [ ] **Logout** — limpar token + dados locais

---

### Fase 4 — Componentes Base (UI Kit)

> **Referência principal:** `design-system/components-*.html` — implementar cada componente com os tokens exatos do `foundation.css`.

#### Tokens e Providers
- [ ] `ThemeProvider` — Provider que injeta tokens + modo dark
- [ ] Criar constantes de cores, spacing, radius a partir do `foundation.css`

#### Componentes (mapeados do design-system HTML)
- [ ] `Button` — primary (`--gt-primary #FF7A1A`), secondary, ghost, outline, icon-button
  - Estados: default, hover (`--gt-primary-hover #FF9249`), active (`--gt-primary-active #E06510`), disabled
  - Altura 56px, radius 16px
- [ ] `TextInput` — com label, placeholder, error, disabled; borda `--gt-border`
- [ ] `Card` — `--gt-surface #151515`, radius 24px, padding configurável
- [ ] `Chip` — `--gt-surface-3 #252525` bg, `--gt-primary #FF7A1A` selected
- [ ] `BottomSheet` / `Drawer` — conforme `components-drawers.html`
- [ ] `Modal` — overlay + conteúdo centralizado
- [ ] `Header` — título + ações (back, close)
- [ ] `TabBar` — bottom tab customizada (72px height, `--gt-surface #151515` bg, `--gt-primary` active)
- [ ] `ScreenLayout` — SafeAreaView + padding + scroll
- [ ] `Loading` / `LoadingOverlay` — spinner ou skeleton
- [ ] `ErrorState` — mensagem + retry button
- [ ] `EmptyState` — ilustração + texto + ação (conforme `components-empty-states.html`)
- [ ] `ListItem` — linha com título, subtítulo, ícone, chevron
- [ ] `ExerciseCard` — thumbnail grande, nome, muscle group chips
- [ ] `RestTimer` — countdown circular + botões pause/skip
- [ ] `SetRow` — linha de série: ordem, peso, reps, checkbox
- [ ] `WeightRepInput` — input combinado peso + reps
- [ ] `ProgressBar` — barra de progresso linear
- [ ] `Icon` — wrapper para @expo/vector-icons

#### Estados implementados para cada componente (conforme DESIGN-MANIFEST.json)
- [ ] default, hover, focus, active, disabled, loading, empty, error, success

---

### Fase 5 — Navegação, Onboarding e Login Flow

- [ ] Configurar `src/app/_layout.tsx` — providers (Theme, QueryClient, AuthProvider, Database init)
  - Check de autenticação: se logado → tabs, senão → login
- [ ] Configurar `src/app/(tabs)/_layout.tsx` — bottom tabs (Home, Exercises, Favorites, Workouts, Settings)
- [ ] **SplashScreen** — animação de entrada com logo centralizado + check de auth
- [ ] **WelcomeScreen / Onboarding** — carrossel de introdução (3 slides)
- [ ] **LoginScreen** + **RegisterScreen** (detalhados na Fase 3)
- [ ] Lógica de onboarding visto + login completo → redirect para tabs
- [ ] Typography e identidade visual aplicada nas telas de onboarding

---

### Fase 6 — Catálogo de Exercícios do Usuário

> **Nota:** Diferente do plano original, o catálogo agora é centrado no usuário. Exercícios vêm dos treinos do usuário (criados por ele ou atribuídos via sync). O sync com a cloud baixa os dados do usuário, não um catálogo global.

- [ ] Seed de exercícios mock para desenvolvimento
- [ ] **ExerciseListScreen**:
  - Search bar com debounce
  - Filters: grupo muscular, equipamento
  - FlashList com os exercícios dos treinos do usuário
  - Skeleton loading
- [ ] **ExerciseDetailsScreen**:
  - Hero image com shared element transition
  - GIF animado demonstrativo (se disponível)
  - Instruções de execução
  - Equipamentos necessários
  - Grupos musculares trabalhados
  - Exercícios alternativos (do mesmo treino do usuário — BR008)
  - Botão de favoritar
- [ ] Shared element transition entre list e detail (Reanimated)
- [ ] Integração TanStack Query para fetch dos dados remotos do usuário
- [ ] Sync incremental: checar versão local vs servidor (dados do usuário)

---

### Fase 7 — Favoritos

- [ ] Criar store Zustand `useFavoritesStore`:
  - `favorites: Set<string>` (IDs)
  - `toggleFavorite(id)`, `isFavorite(id)`, `clearFavorites()`
  - Persistência em MMKV + sync com cloud
- [ ] `FavoriteButton` — coração preenchido/vazio com animação
- [ ] **FavoritesScreen**:
  - Lista de exercícios favoritados
  - Swipe to unfavorite
  - Empty state quando vazio
  - Badge count na tab ("Favoritos")

---

### Fase 8 — Workouts (CRUD com Sync)

- [ ] Criar store Zustand `useWorkoutStore`:
  - `workouts: Workout[]`
  - `createWorkout()`, `updateWorkout()`, `deleteWorkout()`
  - Persistência em SQLite + sync com cloud
- [ ] **WorkoutLibraryScreen**:
  - Lista de treinos do usuário
  - Categorias: Full Body, Upper, Lower, Push, Pull, Legs
  - Botão "Novo Treino" flutuante
- [ ] **CreateWorkoutScreen**:
  - Input de nome
  - Seleção de exercícios
  - Ordenação (drag to reorder)
  - Botão "Criar"
- [ ] **EditWorkoutScreen**:
  - Editar nome
  - Adicionar/remover/reordenar exercícios
- [ ] **WorkoutDetailsScreen**:
  - Visualizar exercícios do treino
  - Botão "Iniciar Treino"

---

### Fase 9 — Execução de Treino

- [ ] Criar store Zustand `useActiveWorkoutStore`:
  - `currentWorkout`, `currentExerciseIndex`, `sets[]`
  - `startWorkout()`, `completeSet()`, `nextExercise()`, `finishWorkout()`
- [ ] **ActiveWorkoutScreen**:
  - Timer de duração do treino
  - Exercício atual em destaque
  - Lista de séries com checkbox
  - Botão "Próximo Exercício"
  - Botão "Finalizar Treino"
  - RestTimer automático entre séries
- [ ] **SetLoggingModal**:
  - Input de peso (kg/lbs)
  - Input de reps
  - RPE opcional
  - Checkbox "Concluído"
- [ ] **RestTimer**:
  - Countdown configurável (30s, 60s, 90s, 120s)
  - Notificação ao término
  - Skip button
- [ ] **WorkoutSummaryScreen**:
  - Duração total
  - Exercícios realizados com séries
  - Volume total
  - Botões "Compartilhar", "Salvar", "Novo Treino"
- [ ] Salvar em `workout_history` e `exercise_progress` ao finalizar

---

### Fase 10 — Histórico, Progresso, Configurações, Testes e Polimento

#### Histórico
- [ ] **HistoryScreen**:
  - Lista de treinos anteriores (data, duração, exercícios, volume)
  - Filtro por período (semana, mês, ano)
  - Busca textual
  - Expandir para ver detalhes do treino

#### Progresso
- [ ] **ProgressDashboard**:
  - Cards: Total de treinos, Volume total, PRs (personal records)
  - Gráfico de treinos por semana
  - Últimos treinos
- [ ] **ExerciseProgressScreen**:
  - Selecionar exercício
  - Gráfico de progressão de peso (linha)
  - Gráfico de volume ao longo do tempo
  - Tabela de histórico de séries
  - PR identificado automaticamente

#### Configurações
- [ ] **SettingsScreen**:
  - Unidade de medida (kg/lbs)
  - Tempo de descanso padrão
  - Tema (dark/light)
  - Forçar sincronização (RF024)
  - Limpar cache local (RF025)
  - Sobre o app
- [ ] **OfflineSyncStatus**:
  - Versão local dos dados do usuário
  - Último sync
  - Botão "Forçar sync"
  - Botão "Limpar cache local"

#### Testes
- [ ] Configurar vitest + @testing-library/react-native
- [ ] Testes unitários para stores (Zustand)
- [ ] Testes unitários para repositórios (SQLite mock)
- [ ] Testes de integração para fluxos principais
- [ ] Testes de componentes do UI Kit

#### Polimento
- [ ] Animações de transição entre telas (Reanimated)
- [ ] Micro-interações: botões com feedback, pull-to-refresh, swipe
- [ ] Haptic feedback em ações importantes
- [ ] Error boundary global
- [ ] Tratamento de erros de rede com retry
- [ ] Empty states para todas as listas
- [ ] Loading skeletons para todas as telas com fetch
- [ ] Deep linking (expo-router)
- [ ] Performance: memo, useCallback, FlashList otimizações, lazy loading

---

## Business Rules (para validar durante implementação)

| ID | Regra | Status |
|---|---|---|
| BR001 | Todo treino deve possuir nome | ☐ |
| BR002 | Treino pode conter múltiplos exercícios | ☐ |
| BR003 | Um exercício pode existir em vários treinos | ☐ |
| BR004 | Carga utilizada deve ser armazenada localmente | ☐ |
| BR005 | Histórico deve permanecer disponível offline | ☐ |
| BR006 | Exercícios favoritos ou exercícios do treino do usuário devem ser acessados online e offline | ☐ |
| BR007 | Catálogo local deve ser atualizado apenas quando existir nova versão do treino do usuário | ☐ |
| BR008 | Substituições de exercícios offline somente de exercícios existentes no treino do usuário | ☐ |
| BR009 | Login obrigatório somente no primeiro acesso. Usuário cadastrado na plataforma, dados ficam disponíveis offline | ☐ |
| BR010 | Treinos não dependem de internet | ☐ |

---

## Requisitos Funcionais (RF)

| ID | Descrição | Seção | Status |
|---|---|---|---|
| RF001 | Listar exercícios | Catálogo | ☐ |
| RF002 | Buscar exercícios | Catálogo | ☐ |
| RF003 | Filtrar exercícios | Catálogo | ☐ |
| RF004 | Consultar exercício | Catálogo | ☐ |
| RF005 | Consultar substituições | Catálogo | ☐ |
| RF006 | Consultar treinos e exercícios dos treinos offline | Offline | ☐ |
| RF007 | Atualizar exercícios quando houver internet | Offline | ☐ |
| RF008 | Sincronização incremental | Offline | ☐ |
| RF009 | Salvar exercício favorito | Favoritos | ☐ |
| RF010 | Remover favorito | Favoritos | ☐ |
| RF011 | Criar treino | Treinos | ☐ |
| RF012 | Editar treino | Treinos | ☐ |
| RF013 | Excluir treino | Treinos | ☐ |
| RF014 | Adicionar exercício ao treino | Treinos | ☐ |
| RF015 | Remover exercício do treino | Treinos | ☐ |
| RF016 | Reordenar exercícios | Treinos | ☐ |
| RF017 | Registrar carga utilizada | Execução | ☐ |
| RF018 | Registrar repetições | Execução | ☐ |
| RF019 | Registrar séries | Execução | ☐ |
| RF020 | Concluir treino | Execução | ☐ |
| RF021 | Consultar treinos realizados | Histórico | ☐ |
| RF022 | Consultar evolução de carga | Histórico | ☐ |
| RF023 | Consultar evolução por exercício | Histórico | ☐ |
| RF024 | Forçar sincronização | Configurações | ☐ |
| RF025 | Limpar cache local | Configurações | ☐ |
