/**
 * MÓDULO DE DADOS MOCK - PROJECT PULSE
 * 
 * ATENÇÃO: Para remover este mock do projeto sem deixar rastros, basta excluir este arquivo
 * e remover sua importação em `src/server.js`.
 */

// Gera datas dinâmicas relativas ao momento da requisição para simular estagnação
const now = Date.now();
const oneDayMs = 24 * 60 * 60 * 1000;

const mockTasks = [
  {
    id: "task-001",
    name: "Refatoração das consultas SQL lentas",
    status: {
      status: "in progress",
      color: "#ffc800",
      orderindex: 1
    },
    priority: {
      priority: "urgent",
      color: "#f50000"
    },
    date_created: String(now - 5 * oneDayMs),
    date_updated: String(now - 1 * oneDayMs),
    due_date: String(now + 2 * oneDayMs), // Vence em 2 dias
    assignees: [
      {
        id: 101,
        username: "Taino Ribeiro",
        initials: "TR",
        color: "#7b68ee"
      }
    ],
    description: "Identificar query bottlenecks na tabela de faturamento executiva."
  },
  {
    id: "task-002",
    name: "Configuração do Gateway de Pagamento",
    status: {
      status: "to do",
      color: "#d3d3d3",
      orderindex: 0
    },
    priority: {
      priority: "high",
      color: "#ffcc00"
    },
    date_created: String(now - 10 * oneDayMs),
    date_updated: String(now - 4 * oneDayMs),
    due_date: String(now - 1 * oneDayMs), // Vencida ontem!
    assignees: [
      {
        id: 102,
        username: "Lucas Silveira",
        initials: "LS",
        color: "#34a853"
      }
    ],
    description: "Homologar as chaves de sandbox do Stripe para a assinatura Pulse."
  },
  {
    id: "task-003",
    name: "Criação do Dashboard de BI (Executivo)",
    status: {
      status: "complete",
      color: "#2ea52e",
      orderindex: 2
    },
    priority: {
      priority: "high",
      color: "#ffcc00"
    },
    date_created: String(now - 6 * oneDayMs),
    date_updated: String(now - 1 * oneDayMs),
    due_date: String(now + 5 * oneDayMs), // Concluída com prazo futuro
    assignees: [
      {
        id: 101,
        username: "Taino Ribeiro",
        initials: "TR",
        color: "#7b68ee"
      }
    ],
    description: "Desenvolver as visões de receita bruta, churn e LTV."
  },
  {
    id: "task-004",
    name: "Revisão Geral de Segurança (PenTest)",
    status: {
      status: "to do",
      color: "#d3d3d3",
      orderindex: 0
    },
    priority: {
      priority: "urgent",
      color: "#f50000"
    },
    date_created: String(now - 1 * oneDayMs),
    date_updated: String(now - 0.5 * oneDayMs),
    due_date: null, // Sem prazo definido
    assignees: [],
    description: "Corrigir possíveis falhas XSS e SQL Injection apontadas pelo scanner."
  },
  {
    id: "task-005",
    name: "Desenho da UI para o Kanban Interativo",
    status: {
      status: "in progress",
      color: "#ffc800",
      orderindex: 1
    },
    priority: {
      priority: "normal",
      color: "#00bfff"
    },
    date_created: String(now - 8 * oneDayMs),
    date_updated: String(now - 6 * oneDayMs),
    due_date: String(now + 1 * oneDayMs), // Vence amanhã
    assignees: [
      {
        id: 103,
        username: "Mariana Souza",
        initials: "MS",
        color: "#ea4335"
      }
    ],
    description: "Prototipar cards dinâmicos usando HSL Hues e micro-animações."
  },
  {
    id: "task-006",
    name: "Definição do escopo e arquitetura do MVP",
    status: {
      status: "complete",
      color: "#2ea52e",
      orderindex: 2
    },
    priority: {
      priority: "normal",
      color: "#00bfff"
    },
    date_created: String(now - 20 * oneDayMs),
    date_updated: String(now - 15 * oneDayMs),
    due_date: String(now - 4 * oneDayMs), // Concluída com prazo estourado no passado
    assignees: [
      {
        id: 101,
        username: "Taino Ribeiro",
        initials: "TR",
        color: "#7b68ee"
      },
      {
        id: 103,
        username: "Mariana Souza",
        initials: "MS",
        color: "#ea4335"
      }
    ],
    description: "Sessão de alinhamento técnico para a stack Next.js + Express."
  },
  {
    id: "task-007",
    name: "Configuração do pipeline de CI/CD",
    status: {
      status: "in progress",
      color: "#ffc800",
      orderindex: 1
    },
    priority: {
      priority: "normal",
      color: "#00bfff"
    },
    date_created: String(now - 2 * oneDayMs),
    date_updated: String(now - 1 * oneDayMs),
    due_date: String(now + 3 * oneDayMs), // Prazo saudável
    assignees: [
      {
        id: 102,
        username: "Lucas Silveira",
        initials: "LS",
        color: "#34a853"
      }
    ],
    description: "Montar as rotinas de build e deploy no GitHub Actions."
  },
  {
    id: "task-008",
    name: "Redação da Proposta Comercial",
    status: {
      status: "to do",
      color: "#d3d3d3",
      orderindex: 0
    },
    priority: {
      priority: "low",
      color: "#808080"
    },
    date_created: String(now - 12 * oneDayMs),
    date_updated: String(now - 10 * oneDayMs),
    due_date: null,
    assignees: [],
    description: "Documentar os custos de infraestrutura e prazos do Método DIZE."
  }
];

function getMockTasks() {
  return mockTasks;
}

module.exports = { getMockTasks };
