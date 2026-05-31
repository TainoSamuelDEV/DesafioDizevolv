# Project Pulse — Dashboard Executivo Executivo para Lideranças

O **Project Pulse** é um Dashboard Executivo desenvolvido sob medida para as lideranças e gestores da Dizevolv Tech. Ele consolida dados de saúde operacional da empresa integrados à API oficial do **ClickUp**, permitindo a identificação imediata de gargalos produtivos e demandas paradas através de um motor inteligente de cálculo de criticidade.

Este projeto adota o **Método DIZE** (Diagnosticar, Intervir, Zipar, Escalar) e utiliza o padrão arquitetural de **BFF (Backend For Frontend)**.

---

## 🏗️ Arquitetura Geral (BFF Pattern)

A aplicação foi estruturada em duas partes desacopladas:

1. **Frontend (`/frontend`):** Interface executiva de alta fidelidade visual desenvolvida com **Next.js (App Router)**, **TypeScript** e **Tailwind CSS**. É focada estritamente em renderização rápida, UI/UX premium (Dark Mode padrão, micro-animações, estados de Skeleton Screen) e filtros dinâmicos.
2. **Backend BFF (`/backend`):** Servidor **Express** seguro que orquestra as consultas ao ClickUp, gerencia credenciais de forma segura (sem vazamentos para o cliente), aplica uma camada de cache temporária de 5 minutos (mitigando *Rate Limits*) e executa o processamento da inteligência de dados.

### A Engine de Criticidade (`status_critico`)
O servidor BFF processa as demandas em tempo real e injeta o campo booleano `status_critico: true` se a tarefa satisfizer qualquer uma das condições:
* A prioridade da tarefa for estritamente **"urgent"**.
* A data de última atualização (`date_updated`) indicar inatividade/estagnação há **mais de 3 dias** em comparação ao momento da requisição (`Date.now() - date_updated > 259.200.000 ms`).

---

## 🛠️ Configuração e Inicialização Local

Você pode inicializar e rodar o projeto de duas formas: usando o **Orquestrador Rápido (Recomendado)** diretamente da raiz ou fazendo a inicialização manual pasta por pasta.

### Requisitos Prévios
* **Node.js** (versão 18.0 ou superior instalada)
* **npm** (gerenciador de pacotes padrão)

---

### Método 1: Orquestrador Rápido (Recomendado)

Criamos um gerenciador de scripts na raiz do projeto para rodar tudo com comandos únicos, sem precisar abrir múltiplos terminais ou gerenciar pastas:

1. **Instalar dependências de ambos os projetos (BFF + Frontend):**
   Rode na raiz do projeto (`/`):
   ```bash
   npm run install:all
   ```

2. **Configurar as Variáveis de Ambiente:**
   Vá até a pasta `backend/` e crie o arquivo `.env` seguindo o modelo abaixo (deixe as chaves do ClickUp vazias para usar o **Modo Mock automático** out-of-the-box):
   ```env
   PORT=3001
   CLICKUP_API_TOKEN=
   CLICKUP_LIST_ID=
   ```

3. **Subir ambas as aplicações simultaneamente:**
   Rode na raiz do projeto (`/`):
   ```bash
   npm run dev
   ```
   > ⚡ Este comando utilizará o utilitário `concurrently` para inicializar de forma paralela e em tempo real o **Backend BFF** (em http://localhost:3001) e o **Frontend Next.js** (em http://localhost:3000).

---

### Método 2: Inicialização Manual (Pasta por Pasta)

Caso prefira gerenciar cada serviço individualmente em terminais dedicados:

#### Passo 1: Inicializar o Backend BFF
1. Entre na pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie o arquivo `.env` na raiz do diretório `backend/` com a sua porta e chaves do ClickUp.
4. Inicie o servidor:
   ```bash
   npm run dev
   ```

#### Passo 2: Inicializar o Frontend Next.js
1. Em um novo terminal, entre na pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor Next.js:
   ```bash
   npm run dev
   ```
4. Acesse o painel em: [http://localhost:3000](http://localhost:3000).

---

## 🎨 Destaques Visuais Premium da UI
* **Kanban Executivo:** Divisão em 3 colunas organizadas e dinâmicas (**To Do**, **Doing** e **Done**) com normalização automática de status nativos do ClickUp.
* **Alerta Visual Agressivo:** Cards identificados como críticos (`status_critico === true`) recebem uma borda vermelha vibrante e pulsante (`critical-card-glow`), um badge contendo a justificativa de atraso/urgência e ícones de atenção Lucide.
* **Métricas Gerais no Topo:** Um bloco de resumo numérico dinâmico contendo o *Total de Demandas*, *Gargalos Críticos* e *Demandas Concluídas* (com cálculo percentual de entrega da sprint).
* **Filtros Ágeis:** Busque instantaneamente por palavras-chaves de tarefas ou selecione membros específicos responsáveis pelo trabalho.
