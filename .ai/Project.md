Você é um arquiteto mobile sênior especializado em React Native.

Crie um aplicativo mobile de exercícios físicos com suporte offline, montagem de treinos e acompanhamento de progresso.

Objetivo:

Permitir que usuários:

- Consultem exercícios
- Salvem exercícios favoritos
- Montem treinos personalizados
- Registrem peso utilizado
- Registrem repetições
- Registrem séries
- Consultem histórico
- Acompanhem progressão de carga
- Utilizem o aplicativo offline

Stack Obrigatória:

- React Native
- Expo Router
- TypeScript
- Zustand
- React Query
- MMKV
- SQLite
- React Native Reanimated
- React Native Gesture Handler
- React Native Shared Element
- React Native FlashList

Arquitetura:

src/
├── app/
├── features/
│ ├── exercises
│ ├── workouts
│ ├── progress
│ ├── favorites
│ ├── settings
│ └── sync
├── components
├── hooks
├── services
├── storage
├── database
├── theme
├── utils

Funcionalidades:

CATÁLOGO

- Lista de exercícios
- Busca
- Filtros
- Paginação
- Favoritos

Categorias:

- Push
- Pull
- Legs
- Core

Filtros:

- Grupo muscular
- Equipamento
- Dificuldade

EXERCÍCIO

Exibir:

- GIF
- Vídeo
- Nome
- Descrição
- Como executar
- Equipamentos
- Grupo muscular
- Exercícios substitutos

ANIMAÇÕES

Utilizar:

- Shared Element Transition
- Reanimated

Transições:

Lista → Detalhes

Imagem do exercício deve expandir suavemente utilizando Shared Element.

TREINOS

Usuário pode criar:

- Full Body
- Treino A
- Treino B
- Treino C
- Upper
- Lower
- Push
- Pull
- Legs

Também pode criar treinos personalizados.

Cada treino possui:

- Nome
- Exercícios
- Ordem dos exercícios

EXECUÇÃO DE TREINO

Ao iniciar treino:

Usuário registra:

- Série
- Repetições
- Peso utilizado

Exemplo:

Supino Reto

Série 1
10 reps
20kg

Série 2
10 reps
22kg

Série 3
8 reps
25kg

PROGRESSÃO

Salvar histórico completo.

Exibir:

- Último peso utilizado
- Melhor peso
- Melhor volume

Volume:

peso × repetições × séries

Exibir evolução por exercício.

HISTÓRICO

Treinos realizados

Data

Duração

Exercícios executados

FAVORITOS

Salvar exercícios favoritos localmente.

OFFLINE FIRST

Primeira execução:

- baixar catálogo da API

Após download:

- consultar tudo localmente

Sem internet:

- catálogo disponível
- treinos disponíveis
- histórico disponível
- progresso disponível

Sincronização futura preparada.

TEMA

Não utilizar tema claro puro nem escuro puro.

Paleta:

Background:
#F3F4F6

Surface:
#FFFFFF

Text:
#111827

Primary:
#2563EB

Accent:
#EF4444

UX

Inspirar-se em:

- Hevy
- Strong
- Boostcamp

Objetivos:

- Poucos toques
- Consulta rápida durante treino
- Animações suaves
- Alto contraste
- Excelente legibilidade

Preparar arquitetura para futura autenticação sem necessidade de refatoração.

Analisando as duas referências, existe um padrão visual muito claro:

### Referência 1 (Wireframe Laranja)

- Preto profundo como fundo principal
- Laranja vibrante como cor de ação
- Cinzas neutros para superfícies
- Muito contraste
- Bordas finas destacadas
- Visual técnico/futurista

### Referência 2 (Fitness App)

- Preto premium
- Cards escuros
- Laranja energético
- Branco para hierarquia de texto
- Imagens grandes e destacadas
- Aparência semelhante a apps fitness premium

---

# Design System - Gym Tracker

## Conceito

**Dark Premium Fitness**

Objetivos:

- Fácil visualização na academia
- Excelente contraste
- Destaque para imagens/GIFs
- Sensação de performance e progresso
- Visual moderno semelhante a:
  - Hevy
  - Strong
  - Nike Training Club
  - Boostcamp

---

# Paleta de Cores

## Background

Tela principal

```css
#0A0A0A
```

---

## Surface 1

Cards

```css
#151515
```

---

## Surface 2

Cards secundários

```css
#1D1D1D
```

---

## Surface 3

Inputs

```css
#252525
```

---

## Primary

Extraída das referências

```css
#FF7A1A
```

---

## Primary Hover

```css
#FF8F3A
```

---

## Primary Pressed

```css
#E76800
```

---

## Success

```css
#22C55E
```

---

## Warning

```css
#F59E0B
```

---

## Error

```css
#EF4444
```

---

# Texto

## Título Principal

```css
#FFFFFF
```

---

## Texto Primário

```css
#F3F4F6
```

---

## Texto Secundário

```css
#B8B8B8
```

---

## Texto Desabilitado

```css
#6B7280
```

---

# Músculos

Seguindo a imagem dos exercícios.

## Músculo Principal

```css
#FF5A36
```

---

## Músculo Secundário

```css
#FF9B4A
```

---

## Corpo

```css
#CFCFCF
```

---

# Espaçamento

Sistema baseado em 8.

```text
4
8
16
24
32
40
48
64
```

---

# Border Radius

## Small

```css
12px
```

---

## Medium

```css
16px
```

---

## Large

```css
24px
```

---

## Hero

```css
32px
```

---

# Tipografia

## Fonte

React Native:

```text
Inter
```

ou

```text
SF Pro Display
```

---

# Escala Tipográfica

## Display

```css
40px
700
```

---

## H1

```css
32px
700
```

---

## H2

```css
24px
600
```

---

## H3

```css
20px
600
```

---

## Body

```css
16px
400
```

---

## Caption

```css
14px
400
```

---

# Componentes

## Bottom Navigation

Altura:

```css
72px
```

Background:

```css
#151515
```

Ícone ativo:

```css
#FF7A1A
```

Ícone inativo:

```css
#6B7280
```

---

## Card de Exercício

```text
┌────────────────────┐
│ GIF               │
│                    │
├────────────────────┤
│ Supino Reto        │
│ Peito • Push       │
└────────────────────┘
```

Background:

```css
#151515
```

Radius:

```css
24px
```

---

## Botão Primário

Background:

```css
#FF7A1A
```

Texto:

```css
#FFFFFF
```

Radius:

```css
16px
```

Altura:

```css
56px
```

---

## Chip

Push / Pull / Legs

Background:

```css
#252525
```

Selecionado:

```css
#FF7A1A
```

---

# Animações

As imagens indicam um app muito focado em movimento.

---

## Shared Element

Lista → Exercício

Imagem cresce até ocupar a tela.

```tsx
SharedElement;
```

---

## Reanimated

Cards:

```text
Fade In
Scale 0.95 → 1
```

---

## Bottom Sheet

Abrir detalhes

```text
Spring Animation
```

---

## Progresso

Peso aumentando:

```text
25kg → 30kg
```

Animação numérica.

---

# Telas

## Splash

Imagem fitness fullscreen.

Logo central.

Botão:

```text
Começar
```

---

## Home

```text
Olá Diego

Seu último treino

Push
Pull
Legs
Core

Exercícios recentes

Treinos
```

---

## Exercícios

Busca

Filtros

Categorias

Lista

---

## Detalhes

Hero Image

GIF

Descrição

Execução

Substituições

Botão:

```text
Adicionar ao treino
```

---

## Treinos

```text
Full Body

Treino A

Treino B

Treino C
```

---

## Execução

Exemplo:

```text
Supino Reto

Série 1
10 reps
20kg

Série 2
10 reps
22kg

Série 3
8 reps
25kg
```

Botão:

```text
Concluir Exercício
```

---

## Histórico

```text
12/06/2026

Push

45 min

Volume:
8.500kg
```

---

# Tokens para React Native

```ts
export const colors = {
  background: '#0A0A0A',

  surface: '#151515',
  surfaceSecondary: '#1D1D1D',
  input: '#252525',

  primary: '#FF7A1A',
  primaryHover: '#FF8F3A',
  primaryPressed: '#E76800',

  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',

  text: '#FFFFFF',
  textSecondary: '#B8B8B8',
  textDisabled: '#6B7280',

  musclePrimary: '#FF5A36',
  muscleSecondary: '#FF9B4A',
};
```

# Diretriz visual final

O app deve combinar:

- A linguagem premium fitness da segunda referência
- O contraste e identidade forte da primeira referência
- Cards escuros com imagens grandes
- Laranja como única cor de destaque
- Pouco ruído visual
- Muito foco em:
  - Exercícios
  - GIFs
  - Progressão de carga
  - Treinos
  - Histórico

Isso cria uma identidade consistente, moderna e adequada para uso durante o treino, inclusive em ambientes com pouca iluminação.

