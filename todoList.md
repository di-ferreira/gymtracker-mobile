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

### Fase 3 — 🔒 Autenticação ✅

- [x] **AuthStore** (`src/features/auth/store.ts`) — Zustand store com estado, login, register, logout, checkAuth
- [x] **AuthProvider** (`src/providers/auth-provider.tsx`) — contexto que chama checkAuth ao montar
- [x] **LoginScreen** (`src/app/(auth)/login.tsx`):
  - Formulário: email + senha com validação
  - Chamada `authService.login()` + armazenamento JWT em MMKV
  - Redirect para `/(tabs)` após sucesso
  - Link para RegisterScreen
- [x] **RegisterScreen** (`src/app/(auth)/register.tsx`):
  - Formulário: nome, email, senha, confirmar senha
  - Chamada `authService.register()` + login automático
  - Redirect para `/(tabs)` após sucesso
  - Link para LoginScreen
- [x] **Root layout** — AuthProvider + Splash redirect (index.tsx)
  - `app/index.tsx`: splash que checa auth → redirect para (auth) ou (tabs)
  - `app/(auth)/_layout.tsx`: stack navigator para login/register
  - `app/_layout.tsx`: GestureHandler + AuthProvider + Stack screens
- [x] **Token refresh interceptor** — já implementado em `src/services/api.ts` (Fase 2)
- [x] **Logout** — `authStore.logout()` limpa tokens MMKV + dados locais

---

### Fase 4 — Componentes Base (UI Kit) ✅

> **Referência principal:** `design-system/components-*.html` — implementar cada componente com os tokens exatos do `foundation.css`.

#### Componentes criados em `src/components/ui/`
- [x] `ThemeProvider` — `src/theme/ThemeProvider.tsx`
- [x] `Button` — primary, secondary, ghost, outline; altura 56px, radius 16px, loading/disabled states
- [x] `TextInput` — label, placeholder, error, disabled; borda `--gt-border`
- [x] `Card` — `--gt-surface #151515`, radius 24px, padding configurável
- [x] `Chip` — `--gt-surface-3 #252525` bg, `--gt-primary #FF7A1A` selected
- [x] `Header` — título + ações (back, close)
- [x] `ScreenLayout` — SafeAreaView + padding + scroll toggle
- [x] `Loading` / `LoadingOverlay` — spinner + mensagem
- [x] `ErrorState` — mensagem + retry button
- [x] `EmptyState` — título, descrição, action button
- [x] `ListItem` — título + subtítulo + chevron
- [x] `ExerciseCard` — thumbnail, nome, muscle group
- [x] `RestTimer` — countdown + skip + progress bar (completa Fase 9 RestTimer também)
- [x] `SetRow` — numeração, peso, reps, checkbox toggle
- [x] `WeightRepInput` — inputs combinados peso + reps
- [x] `ProgressBar` — barra linear com progress%

#### Pendentes (postergados para Fase 5+ quando necessários)
- [ ] `BottomSheet` / `Drawer` — quando houver tela que precise
- [ ] `Modal` — quando houver tela que precise
- [ ] `TabBar` — Fase 5 (navegação)
- [ ] `Icon` — wrapper @expo/vector-icons (Fase 5+)

---

### Fase 5 — Navegação, Onboarding e Login Flow ✅

- [x] **Root layout** (`src/app/_layout.tsx`) — ThemeProvider + QueryClientProvider + AuthProvider + DB init
- [x] **Bottom tabs** (`src/app/(tabs)/_layout.tsx`) — theme tokens (cores, altura 72px, label style)
- [x] **SplashScreen** (`src/app/index.tsx`) — animação fadeIn + spring scale, check onboarding + auth → redirect
- [x] **Onboarding** (`src/app/(onboarding)/index.tsx`) — FlatList horizontal com 3 slides, pagination dots, "Próximo"/"Pular"/"Começar"
- [x] **LoginScreen** — refatorada com `Button` e `TextInput` do UI Kit, typography tokens
- [x] **RegisterScreen** — refatorada com `Button` e `TextInput` do UI Kit, typography tokens
- [x] **Fluxo completo**: Splash → Onboarding? → Login/Register → Tabs
  - `isOnboardingDone()` do AsyncStorage → se false, redirect para `/(onboarding)`
  - `setOnboardingDone()` ao completar → redirect para `/(auth)/login`
  - Login/Register bem-sucedido → redirect para `/(tabs)`

---

### Fase 6 — Catálogo de Exercícios do Usuário ✅

> **Nota:** Diferente do plano original, o catálogo agora é centrado no usuário. Exercícios vêm dos treinos do usuário (criados por ele ou atribuídos via sync). O sync com a cloud baixa os dados do usuário, não um catálogo global.

- [x] **Seed data** (`src/database/seed.ts`) — 8 exercícios mock com muscle_groups, movement_groups, equipments, instruções e alternativas
- [x] **Seed integrado** — chamado automático no `getDatabase()` após migrações (só popula se tabela vazia)
- [x] **Hooks TanStack Query** (`src/hooks/useExercises.ts`):
  - `useExercises()` — lista completa para ExerciseListScreen
  - `useExercise(id)` — detalhes com joins (muscle_group, movement_group, equipment, instructions, alternatives)
- [x] **ExerciseListScreen** (`src/app/(tabs)/exercises.tsx`):
  - Search bar com filtro textual (nome + descrição)
  - Chips de filtro por grupo muscular
  - Grid 2 colunas com ExerciseCard
  - Loading / ErrorState / EmptyState
- [x] **ExerciseDetailsScreen** (`src/app/exercise/[id].tsx`):
  - Hero placeholder com gradiente
  - Nome, tags (grupo muscular + movimento)
  - Descrição, equipamentos, instruções numeradas
  - Dicas de execução com destaque
  - Exercícios alternativos com navegação
  - Botão favoritar (AsyncStorage + toggle)
  - Back button
- [x] **Rota adicionada** `exercise/[id]` no root layout com `slide_from_right`

#### Pendentes (pós-MVP)
- [ ] Shared element transition (Reanimated) — postergado para polimento (Fase 10)
- [ ] GIF animado demonstrativo — quando URLs reais estiverem disponíveis
- [ ] Sync incremental com servidor — quando API estiver disponível

---

### Fase 7 — Favoritos ✅

- [x] **FavoritesStore** (`src/features/favorites/store.ts`) — Zustand: `load()`, `toggle()`, `clear()`, `isFavorite()` com persistência AsyncStorage
- [x] **FavoriteButton** (`src/components/ui/FavoriteButton.tsx`) — estrela preenchida/vazia com toggle
- [x] **FavoritesScreen** (`src/app/(tabs)/favorites.tsx`):
  - Grid 2 colunas com ExerciseCard para exercícios favoritados
  - Empty state com link para explorar exercícios
  - Contagem de favoritos no header
- [x] **Badge na tab** — contagem com bolinha laranja no ícone "Favoritos"
- [x] **ExerciseDetail** refatorado para usar `useFavoritesStore` + `FavoriteButton`

---

### Fase 8 — Workouts (CRUD com Sync) ✅

- [x] **WorkoutsStore** (`src/features/workouts/store.ts`) — Zustand: `load()`, `create()`, `update()`, `remove()` com SQLite via repositório
- [x] **WorkoutLibraryScreen** (`src/app/(tabs)/workouts.tsx`):
  - Grid 2 colunas com cards de treino (nome + contagem de exercícios)
  - Botão "Novo Treino" flutuante (FAB)
  - Empty state com CTA
  - `useFocusEffect` pra recarregar ao voltar
- [x] **CreateWorkoutScreen** (`src/app/workout/create.tsx`):
  - Inputs: nome (obrigatório), descrição (opcional)
  - Validação, loading, redirect ao criar
  - Slide from bottom
- [x] **WorkoutDetailsScreen** (`src/app/workout/[id]/index.tsx`):
  - Nome, descrição, contagem de exercícios
  - Lista de exercícios com ExerciseCard
  - Empty state quando sem exercícios
  - Botão "Excluir" com Alert confirm
  - Botão "Editar" no header
- [x] **EditWorkoutScreen** (`src/app/workout/[id]/edit.tsx`):
  - Inputs preenchidos com dados atuais
  - Validação, loading, volta ao salvar
  - Slide from bottom
- [x] **Rotas** adicionadas ao root layout

#### Pendentes
- [ ] Seleção de exercícios ao criar/editar treino
- [ ] Reordenação (drag to reorder)
- [ ] Botão "Iniciar Treino" — Fase 9

---

### Fase 9 — Execução de Treino ✅

- [x] **ActiveWorkoutStore** (`src/features/workouts/active-store.ts`) — Zustand:
  - `startWorkout()` — carrega exercícios do treino, cria `workout_history`, inicia timer
  - `completeSet()` — registra peso/reps/RPE, marca concluído, inicia rest timer
  - `toggleSet()` / `addSet()` — gerenciamento de séries
  - `nextExercise()` / `prevExercise()` — navegação entre exercícios
  - `finishWorkout()` — salva em `workout_history` e `exercise_progress`, calcula volume
- [x] **ActiveWorkoutScreen** (`src/app/workout/[id]/start.tsx`):
  - Timer de duração do treino (elapsed)
  - Barra de progresso (exercício atual / total)
  - Nome do exercício atual + lista de séries com SetRow
  - SetLogging: WeightRepInput + RPE toggle + "Concluir Série"
  - RestTimer automático pós-série (60s) com skip
  - "Próximo Exercício" / "Finalizar Treino" ao completar todas séries
  - "+ Adicionar série" extra
- [x] **WorkoutSummaryScreen** (`src/app/workout/summary.tsx`):
  - Badge de conclusão, duração formatada, volume total
  - Botões: "Novo Treino", "Voltar ao Início"
- [x] **WorkoutDetailScreen** — adicionado botão "Iniciar Treino"
- [x] **Rotas**: `workout/[id]/start` (slide), `workout/summary` (fade)
- [x] **RestTimer** — já existente da Fase 4, reutilizado

---

### Fase 10 — Histórico, Progresso, Configurações, Testes e Polimento ✅

#### Histórico
- [x] **HistoryScreen** (`src/app/history/index.tsx`):
  - Lista de treinos anteriores com nome, data, exercícios, duração, volume
  - Navegação para detalhes do treino
  - Empty state
- [x] **HistoryDetailScreen** (`src/app/history/[id].tsx`):
  - Detalhes do treino: duração, volume, exercícios com séries
  - Sets agrupados por exercício

#### Progresso
- [x] **ProgressDashboard** (`src/app/(tabs)/index.tsx`):
  - Cards: Total de treinos, Volume total, Duração do último treino
  - Lista dos 5 treinos mais recentes
  - Link "Ver todos" para histórico completo
- [x] **ExerciseProgressScreen** (`src/app/exercise/[id]/progress.tsx`):
  - Personal Record (PR) destacado
  - Histórico de séries por treino
  - Botão "Ver Progresso" no ExerciseDetail

#### Configurações
- [x] **SettingsScreen** (`src/app/(tabs)/settings.tsx`):
  - Unidade de peso (kg/lbs toggle)
  - Tempo de descanso padrão (30/60/90/120s)
  - Tema (exibição, toggle futuro)
  - Forçar sincronização (placeholder)
  - Limpar cache local com confirm
  - Versão do app

#### Testes (postergados)
- [ ] Configurar vitest + @testing-library/react-native
- [ ] Testes unitários para stores (Zustand)
- [ ] Testes unitários para repositórios (SQLite mock)

#### Polimento (postergado)
- [ ] Animações de transição com Reanimated
- [ ] Pull-to-refresh, haptic feedback
- [ ] Error boundary global
- [ ] Deep linking
- [ ] Performance: memo, useCallback, FlashList otimizações

---

## Business Rules (para validar durante implementação)

| ID | Regra | Status |
|---|---|---|---|
| BR001 | Todo treino deve possuir nome | ✅ |
| BR002 | Treino pode conter múltiplos exercícios | ✅ |
| BR003 | Um exercício pode existir em vários treinos | ✅ |
| BR004 | Carga utilizada deve ser armazenada localmente | ✅ |
| BR005 | Histórico deve permanecer disponível offline | ✅ |
| BR006 | Exercícios favoritos ou exercícios do treino do usuário devem ser acessados online e offline | ✅ |
| BR007 | Catálogo local deve ser atualizado apenas quando existir nova versão do treino do usuário | ☐ (API-dependente) |
| BR008 | Substituições de exercícios offline somente de exercícios existentes no treino do usuário | ✅ |
| BR009 | Login obrigatório somente no primeiro acesso. Usuário cadastrado na plataforma, dados ficam disponíveis offline | ✅ |
| BR010 | Treinos não dependem de internet | ✅ |

---

## Requisitos Funcionais (RF)

| ID | Descrição | Seção | Status |
|---|---|---|---|
| RF001 | Listar exercícios | Catálogo | ✅ |
| RF002 | Buscar exercícios | Catálogo | ✅ |
| RF003 | Filtrar exercícios | Catálogo | ✅ |
| RF004 | Consultar exercício | Catálogo | ✅ |
| RF005 | Consultar substituições | Catálogo | ✅ |
| RF006 | Consultar treinos e exercícios dos treinos offline | Offline | ✅ |
| RF007 | Atualizar exercícios quando houver internet | Offline | ☐ (API) |
| RF008 | Sincronização incremental | Offline | ☐ (API) |
| RF009 | Salvar exercício favorito | Favoritos | ✅ |
| RF010 | Remover favorito | Favoritos | ✅ |
| RF011 | Criar treino | Treinos | ✅ |
| RF012 | Editar treino | Treinos | ✅ |
| RF013 | Excluir treino | Treinos | ✅ |
| RF014 | Adicionar exercício ao treino | Treinos | ☐ (UI) |
| RF015 | Remover exercício do treino | Treinos | ☐ (UI) |
| RF016 | Reordenar exercícios | Treinos | ☐ (UI) |
| RF017 | Registrar carga utilizada | Execução | ✅ |
| RF018 | Registrar repetições | Execução | ✅ |
| RF019 | Registrar séries | Execução | ✅ |
| RF020 | Concluir treino | Execução | ✅ |
| RF021 | Consultar treinos realizados | Histórico | ✅ |
| RF022 | Consultar evolução de carga | Histórico | ✅ |
| RF023 | Consultar evolução por exercício | Histórico | ✅ |
| RF024 | Forçar sincronização | Configurações | ☐ (API) |
| RF025 | Limpar cache local | Configurações | ✅ |
