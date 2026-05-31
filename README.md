# 🟠 Project Pulse — Dashboard Executivo para Lideranças (Desafio Dizevolv)

O **Project Pulse** é um Dashboard Executivo de alto padrão visual desenvolvido sob medida para lideranças e gestores da **Dizevolv Tech**. Ele consolida dados de saúde operacional da empresa integrados à API oficial do **ClickUp**, permitindo a identificação imediata de gargalos produtivos e demandas paradas por meio de um motor inteligente de cálculo de criticidade em tempo real.

O projeto adota o **Método DIZE** (*Diagnosticar, Intervir, Zipar, Escalar*) e utiliza o padrão arquitetural de **BFF (Backend For Frontend)**.

---

## 🏗️ Arquitetura Geral & Tecnologias

A aplicação é dividida em dois microsserviços desacoplados e otimizados:

1. **Frontend (`/frontend`):** 
   - **Framework:** Next.js 14 (App Router) + TypeScript.
   - **Styling:** Tailwind CSS integrado a variáveis CSS puras e dinâmicas.
   - **UI/UX Premium:** Design de alta fidelidade com visual translúcido (*glassmorphic*), micro-animações, estados de carregamento (*Skeleton Screens*), modo escuro sob demanda e adaptabilidade de cores nativas do ClickUp.
2. **Backend (`/backend`):** 
   - **Framework:** Node.js puro com **Express.js**.
   - **Segurança:** Isolação completa de tokens de API. Nenhuma chave do ClickUp é exposta ao cliente final.
   - **Performance:** Camada de cache em memória temporária de 5 minutos, reduzindo drasticamente o consumo de cotas de API e mitigando bloqueios por *Rate Limits*.
   - **Modo Auto-Resiliente (Mock):** Fallback automático inteligente para dados mockados caso as chaves de API não estejam configuradas no ambiente.

---

## 🚀 Como Rodar o Projeto Localmente

O repositório possui um **Orquestrador de Comandos na Raiz**, permitindo gerenciar todo o ecossistema com comandos únicos.

### Pré-requisitos
- **Node.js** (versão 18.0 ou superior instalada)
- **npm** (gerenciador de pacotes padrão)

---

### Método A: Orquestrador Rápido (Recomendado)

Rode tudo a partir da raiz do repositório, em um único terminal:

1. **Instalar dependências de todos os serviços (Frontend + Backend):**
   ```bash
   npm run install:all
   ```

2. **Configurar as Variáveis de Ambiente:**
   Crie um arquivo `.env` dentro da pasta `backend/` baseando-se no arquivo `.env.example` (ou use a estrutura descrita abaixo).
   
   *Dica:* Deixe as chaves do ClickUp em branco se quiser testar a aplicação de imediato usando o **Modo Mock automático**.
   ```env
   PORT=3001
   CLICKUP_API_TOKEN=seu_personal_token_aqui
   CLICKUP_LIST_ID=seu_list_id_aqui
   ```

3. **Executar a aplicação em modo desenvolvimento:**
   ```bash
   npm run dev
   ```
   > ⚡ Este comando utiliza o utilitário `concurrently` para subir simultaneamente o **Backend** (na porta `3001`) e o **Frontend Next.js** (na porta `3000`) com logs unificados e coloridos.

---

### Método B: Inicialização Manual (Separada)

Caso prefira monitorar cada processo separadamente:

#### Passo 1: Inicializar o Backend
```bash
cd backend
npm install
# Crie o arquivo .env conforme o modelo acima
npm run dev
```

#### Passo 2: Inicializar o Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Acesse o painel em seu navegador: **[http://localhost:3000](http://localhost:3000)**.

---

## 🎨 Destaques Visuais Premium & Design System

A interface do **Project Pulse** foi reprojetada do zero sob o design system **Phoenix Flow** para garantir elegância corporativa, altíssimo contraste e micro-interações vivas:

### 🌟 1. Customização Rápida de Marca (Brand Color)
A paleta de cores primária e secundária da aplicação foi totalmente abstraída em variáveis nativas do CSS no arquivo [globals.css](file:///c:/Users/Admin/Documents/Dizevolv/frontend/src/app/globals.css):
```css
:root {
  --primary: #FD520A;          /* Laranja vibrante Dizevolv padrão */
  --primary-hover: #FD520A;
  --primary-glow: rgba(253, 82, 10, 0.08);
}
```
Isso permite mudar o tom da marca (como botões, ícones, badges e progressos) em um único ponto do CSS global.

### 🌗 2. Dark Mode Nativo sem Conflitos de Sistema
Para evitar o bug comum do Tailwind v4 em que preferências do sistema operacional estragam o contraste no modo claro, foi configurada uma variante customizada no topo do CSS global:
```css
@custom-variant dark (&:where(.dark, .dark *));
```
Esta configuração garante um controle de cores rigoroso, resultando em um fundo preto premium (`#111111`) e cards escuros de alta distinção (`#222222` com bordas `#323233`) que anulam qualquer opacidade ou texto ilegível.

### 🧪 3. Colunas de Kanban Translúcidas (*Glassmorphism*)
Cada status de coluna (**To Do**, **Doing** e **Done**) recebeu um aspecto de vidro jateado moderno com blur de fundo e transparência refinada (`backdrop-blur-md` e fundos HSL/RGB translúcidos), mantendo os cards suspensos no espaço de trabalho com profundidade tridimensional.

### 🔴 4. Border-Spin Glow em Demandas Críticas
As tarefas categorizadas com `status_critico === true` recebem um tratamento de urgência ativo e dinâmico:
- Um gradiente cônico em rotação contínua ao redor do perímetro do card (`conic-gradient` + animação `spin` infinita de 2 segundos).
- O efeito de borda brilhante e o neon vermelho são **desativados automaticamente** quando a demanda é movida para a coluna **Concluído (Done)**, indicando que o gargalo foi devidamente solucionado.

### 📊 5. Sincronização Dinâmica de Cores do ClickUp
Tanto os marcadores de seção de cada coluna quanto os elementos da listagem (incluindo o progresso de subtarefas e indicadores internos de cartões detalhados) herdam **em tempo real** a cor original configurada para aquele status dentro do ClickUp.

### 📈 6. Bloco Executivo e Barra de Progresso Real-time
No cabeçalho do painel, os gestores contam com uma visão estatística resumida:
- **Total de Demandas** em andamento.
- **Gargalos Críticos** identificados e estagnados.
- **Percentual Geral de Conclusão da Sprint**, acoplado a uma barra de progresso horizontal moderna que atualiza dinamicamente de acordo com as entregas.

### 🧩 7. Integração & Acordeão de Subtarefas
O dashboard agora suporta o desdobramento de demandas complexas em subtarefas:
- **Agrupamento Automático:** O Backend busca tanto tarefas quanto subtarefas de forma simultânea via API do ClickUp (`&subtasks=true`), organizando as subtasks dentro de seus respectivos cartões-pai antes de enviar ao frontend.
- **Visualização Condicional Expandida:** Cartões com subtarefas exibem uma seção expansível com ícone de camadas e um contador. Ao clicar no cartão (ou no botão expansor), a seção se abre com uma animação suave.
- **Detalhes Completos:** Exibe o título de cada subtarefa com indicador visual de status concluído ou não (ícone e tachado) e sua respectiva prioridade mapeada e colorida.

---

## ⚡ A Engine do Motor de Criticidade (`status_critico`)

Para auxiliar na tomada de decisão estratégica de forma direta, o Backend analisa as tarefas retornadas do ClickUp e injeta o campo `status_critico = true` de forma automatizada caso cumpra qualquer uma das regras:

1. **Urgência Crítica:** A prioridade da tarefa é estritamente **"urgent"**.
2. **Estagnação Operacional:** A propriedade `date_updated` indica que a tarefa está **sem modificações ou interações há mais de 3 dias** em relação à data atual do servidor (`Date.now() - date_updated > 259.200.000 ms`).

Isso fornece um relatório instantâneo de quais demandas precisam de intervenção da liderança sem sobrecarregar o gestor com análises manuais de relatórios.


---
*Desenvolvido com foco em UI/UX, Agilidade de Entrega e Robusteza Arquitetural. ⚡*
