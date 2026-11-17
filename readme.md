# ⚽ FutebolSorter — Gerenciador e Sorteador de Times para Rachas

Aplicativo web moderno e responsivo desenvolvido em **React (Next.js App Router)** e **Tailwind CSS**, projetado para organizar partidas de futebol ("Rachas") de **Futsal/Society 5 (5x5)**, **Society 7 (7x7)** e **Futebol de Campo 11 (11x11)**.

---

## ✨ Funcionalidades Principais

1. **Gestão de Jogadores (Elenco & Disponibilidade)**
   - Banco de dados inicial (Mock + persistência automática via `localStorage`) com jogadores divididos por posição: **Goleiro**, **Zagueiro**, **Meio-campista** e **Atacante**.
   - Adição rápida em 1 clique na barra superior ou cadastro completo via Modal fluido (com nível técnico em estrelas e status).
   - Alternância rápida de presença (`Disponível` / `Indisponível`), filtros por posição e busca em tempo real.

2. **Configuração da Partida**
   - Formatos suportados: **5x5** (10 titulares), **7x7** (14 titulares) e **11x11** (22 titulares).
   - **Trava de Equilíbrio de Goleiros:** Impede que um time fique sem goleiro quando há goleiros suficientes confirmados.
   - **Equilíbrio Tático por Posição:** Distribui defensores, meio-campistas e atacantes de forma justa entre as duas equipes.
   - Personalização dos nomes das equipes (ex: *Time Laranja* vs *Time Preto*).

3. **Dois Modos de Montagem dos Times**
   - **Modo Sorteio Automático:** Algoritmo Fisher-Yates combinado com distribuição balanceada de goleiros e posições, alocando automaticamente os excedentes no banco de reservas.
   - **Modo Manual (Draft):** Tela dividida com lista de jogadores disponíveis à esquerda e painéis do **Time A**, **Time B** e **Reservas** à direita. Suporta escalação em 1 clique (`+ Time A` / `+ Time B`) ou *Drag and Drop* (arrastar e soltar), além de botão para autocompletar vagas restantes.

4. **Visualização do Confronto & Exportação para WhatsApp**
   - Cards de escalação organizados por posição, indicadores de força média e presença de goleiro.
   - **Modo Campinho Tático:** Alternância para visualizar os dois times posicionados no gramado.
   - **Lista de Reservas / De Próxima:** Exibição clara dos jogadores excedentes com troca rápida de time (`⇄`).
   - **Copiar Escalação (WhatsApp):** Gera e copia com 1 clique a lista completa formatada com emojis e negrito pronta para colar no grupo do WhatsApp.

---

## 🗂️ Estrutura do Projeto

```text
src/
├── app/
│   ├── globals.css          # Estilos globais Tailwind e animações suaves
│   ├── layout.tsx           # Root Layout (Next.js App Router)
│   └── page.tsx             # Página principal gerenciando estado e abas
├── components/
│   ├── Header.tsx           # Barra superior responsiva, KPIs e Dark/Light mode
│   ├── PositionBadge.tsx    # Badges coloridas por posição (GOL, ZAG, MEI, ATA)
│   ├── PlayerManagement.tsx # Aba 1: Gestão de elenco, busca, filtros e adição rápida
│   ├── PlayerModal.tsx      # Modal fluido para criar ou editar jogadores
│   ├── MatchConfigBar.tsx   # Seletor de formato (5x5, 7x7, 11x11) e regras de equilíbrio
│   ├── TeamBuilder.tsx      # Aba 2: Modo Sorteio Automático + Modo Manual (Draft)
│   └── MatchupView.tsx      # Aba 3: Confronto final, Campinho Tático e cópia WhatsApp
├── data/
│   └── mockPlayers.ts       # Jogadores iniciais, metadados de posição e formatos
├── types/
│   └── soccer.ts            # Tipagens TypeScript completas
└── utils/
    └── teamSorter.ts        # Algoritmo de sorteio balanceado e formatação WhatsApp
```

---

## 🚀 Como Executar Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Acesse `http://localhost:3000` no navegador.
