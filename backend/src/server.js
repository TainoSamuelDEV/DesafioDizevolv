const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configura cache local de 5 minutos (300 segundos TTL)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

app.use(cors());
app.use(express.json());

// Limpa aspas e espaços extras comuns em arquivos .env
const rawToken = process.env.CLICKUP_API_TOKEN || '';
const rawListId = process.env.CLICKUP_LIST_ID || '';

const cleanToken = rawToken.replace(/["'\s]/g, '');
let cleanListId = rawListId.replace(/["'\s]/g, '');

// Extração inteligente de ID se o usuário colar a URL completa da lista
// Exemplo: https://app.clickup.com/90171282270/v/li/901714184372
if (cleanListId.includes('/li/')) {
  const parts = cleanListId.split('/li/');
  cleanListId = parts[parts.length - 1];
}

// Log de status de inicialização do ClickUp Token
const isClickUpConfigured = !!(cleanToken && cleanListId);
if (isClickUpConfigured) {
  console.log(`⚡ [Pulse Backend] Integração oficial configurada. List ID: ${cleanListId}`);
} else {
  console.log('⚠️ [Pulse Backend] CLICKUP_API_TOKEN ou CLICKUP_LIST_ID vazios no .env.');
  console.log('💡 [Pulse Backend] Iniciando no Modo Mock Automático.');
}

/**
 * ENGINE DE CRITICIDADE (INTELIGÊNCIA DE DADOS)
 * Injeta o campo `status_critico` nas tarefas baseado nas regras de negócio da Dizevolv.
 */
function processTaskCriticism(tasks) {
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000; // 259.200.000 ms
  const now = Date.now();

  return tasks.map(task => {
    // 1. Extração da prioridade de forma segura
    let priorityStr = '';
    if (task.priority) {
      if (typeof task.priority === 'string') {
        priorityStr = task.priority.toLowerCase();
      } else if (task.priority.priority) {
        priorityStr = task.priority.priority.toLowerCase();
      }
    }

    // 2. Extração da data de última atualização (convertendo string/timestamp de ms)
    const updatedTimestamp = task.date_updated ? Number(task.date_updated) : now;
    const idleTime = now - updatedTimestamp;

    // 3. Aplicação da Regra Matemática de Criticidade (Apenas para tarefas NÃO concluídas/fechadas)
    let isClosed = false;
    if (task.status && task.status.status) {
      const statusClean = task.status.status.toLowerCase().replace(/[^a-z]/g, '');
      if (
        statusClean.includes('done') || 
        statusClean.includes('complete') || 
        statusClean.includes('concluido') || 
        statusClean.includes('finalizado') || 
        statusClean.includes('entregue') ||
        statusClean.includes('feito')
      ) {
        isClosed = true;
      }
    }

    const isUrgent = priorityStr === 'urgent';
    const isStagnant = idleTime > threeDaysMs;
    const status_critico = !isClosed && (isUrgent || isStagnant);

    return {
      ...task,
      status_critico,
      // Adiciona metadados adicionais úteis para o UI/UX depurar
      criticidade_detalhes: {
        isUrgent,
        isStagnant,
        diasSemAtualizar: Math.floor(idleTime / (24 * 60 * 60 * 1000))
      }
    };
  });
}

/**
 * ROTA DE STATUS: GET /
 * Retorna o status do BFF e os endpoints disponíveis
 */
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '🚀 Project Pulse BFF da Dizevolv Tech está rodando com sucesso!',
    endpoints: {
      tasks: '/api/tasks'
    },
    modo: isClickUpConfigured ? 'ClickUp Live' : 'Mock (Fallback Autônomo)'
  });
});

/**
 * ROTA PRINCIPAL: GET /api/tasks
 * Retorna as tarefas prontas para renderização do Kanban
 */
app.get('/api/tasks', async (req, res) => {
  try {
    // Mock List Details padrão para uso offline / fallbacks
    const mockListDetails = {
      name: "Sprint Atual - Project Pulse",
      folder: "Assessoria Tecnológica",
      space: "Dizevolv Tech",
      statuses: [
        { status: "pendente", color: "#64748b" },
        { status: "em progresso", color: "#f59e0b" },
        { status: "feito", color: "#10b981" },
        { status: "concluido", color: "#10b981" }
      ]
    };

    // Se o ClickUp NÃO estiver configurado, usa o mockData (facilmente deletável)
    if (!isClickUpConfigured) {
      const { getMockTasks } = require('./mockData');
      const processedTasks = processTaskCriticism(getMockTasks());
      return res.json({
        source: 'mock',
        listDetails: mockListDetails,
        tasks: processedTasks
      });
    }

    // Se estiver configurado, tenta buscar do Cache primeiro para evitar Rate Limiting
    const bypassCache = req.query.bypassCache === 'true';
    const cacheKey = `tasks_${cleanListId}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData && !bypassCache) {
      console.log('📦 [Pulse BFF Cache] Retornando dados em cache da API do ClickUp.');
      return res.json({
        source: 'cache',
        listDetails: cachedData.listDetails,
        tasks: cachedData.tasks
      });
    }

    if (bypassCache) {
      console.log('🔄 [Pulse BFF API] Ignorando cache por solicitação do cliente (bypassCache=true).');
    }

    // Faz a consulta paralela ao List Details e às Tasks do ClickUp (incluindo subtasks)
    console.log('🌐 [Pulse BFF API] Consultando API oficial do ClickUp em paralelo (List Details + Tasks com subtasks)...');
    
    const [listResponse, tasksResponse] = await Promise.all([
      axios.get(`https://api.clickup.com/api/v2/list/${cleanListId}`, {
        headers: { 'Authorization': cleanToken }
      }),
      axios.get(`https://api.clickup.com/api/v2/list/${cleanListId}/task?include_closed=true&subtasks=true`, {
        headers: { 'Authorization': cleanToken }
      })
    ]);

    const listData = listResponse.data;
    const listDetails = {
      name: listData.name,
      folder: listData.folder ? listData.folder.name : 'Lista Avulsa',
      space: listData.space ? listData.space.name : (listData.folder && listData.folder.space ? listData.folder.space.name : 'Espaço Padrão'),
      statuses: listData.statuses ? listData.statuses.map(s => ({
        status: s.status,
        color: s.color
      })) : []
    };

    const rawTasks = tasksResponse.data.tasks || [];
    
    // Agrupamento Inteligente de Subtasks sob tarefas-pai
    const taskMap = {};
    rawTasks.forEach(task => {
      taskMap[task.id] = {
        ...task,
        subtasks: task.subtasks ? [...task.subtasks] : []
      };
    });

    const topLevelTasks = [];
    rawTasks.forEach(task => {
      const mappedTask = taskMap[task.id];
      const parentId = task.parent && (typeof task.parent === 'string' ? task.parent : task.parent.id);
      
      if (parentId && taskMap[parentId]) {
        // Evita duplicar na inserção
        const alreadyExists = taskMap[parentId].subtasks.some(sub => sub.id === mappedTask.id);
        if (!alreadyExists) {
          taskMap[parentId].subtasks.push(mappedTask);
        }
      } else {
        topLevelTasks.push(mappedTask);
      }
    });

    // Pós-processamento de Desduplicação Definitiva por ID
    Object.values(taskMap).forEach(task => {
      if (task.subtasks && task.subtasks.length > 0) {
        const seen = new Set();
        task.subtasks = task.subtasks.filter(sub => {
          if (!sub || !sub.id || seen.has(sub.id)) return false;
          seen.add(sub.id);
          return true;
        });
      }
    });

    const processedTasks = processTaskCriticism(topLevelTasks);

    const payloadToCache = {
      listDetails,
      tasks: processedTasks
    };

    // Salva no cache com TTL padrão (5 minutos)
    cache.set(cacheKey, payloadToCache);

    return res.json({
      source: 'api',
      listDetails,
      tasks: processedTasks
    });

  } catch (error) {
    console.error('❌ [Pulse BFF Error] Erro ao buscar dados:', error.message);
    
    // Tratamento de erro resiliente
    try {
      console.log('🔄 [Pulse BFF Resiliência] Acionando Modo Mock de segurança para manter a UI funcionando.');
      const { getMockTasks } = require('./mockData');
      const processedTasks = processTaskCriticism(getMockTasks());
      
      const mockListDetails = {
        name: "Sprint Atual - Project Pulse",
        folder: "Assessoria Tecnológica",
        space: "Dizevolv Tech",
        statuses: [
          { status: "pendente", color: "#64748b" },
          { status: "em progresso", color: "#f59e0b" },
          { status: "feito", color: "#10b981" },
          { status: "concluido", color: "#10b981" }
        ]
      };

      return res.status(200).json({
        source: 'mock_fallback_on_error',
        error: error.message,
        listDetails: mockListDetails,
        tasks: processedTasks
      });
    } catch (mockError) {
      return res.status(500).json({
        success: false,
        error: 'Erro grave no processamento de dados do ClickUp e falha no fallback.',
        details: error.message
      });
    }
  }
});

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`🚀 [Pulse BFF] Servidor rodando em http://localhost:${PORT}`);
});
