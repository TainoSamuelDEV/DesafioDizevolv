"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  AlertTriangle, 
  CheckCircle, 
  ListTodo, 
  Search, 
  User, 
  RefreshCw, 
  Layers, 
  Calendar, 
  Clock, 
  Info,
  HelpCircle,
  Database
} from "lucide-react";

interface Assignee {
  id: number;
  username: string;
  initials: string;
  color?: string;
}

interface Priority {
  priority: string;
  color: string;
}

interface Task {
  id: string;
  name: string;
  status: {
    status: string;
    color: string;
  };
  priority: Priority | null;
  date_created: string;
  date_updated: string;
  due_date: string | null;
  assignees: Assignee[];
  description: string | null;
  status_critico: boolean;
  criticidade_detalhes?: {
    isUrgent: boolean;
    isStagnant: boolean;
    diasSemAtualizar: number;
  };
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<string>("mock");
  const [filterText, setFilterText] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // URL do BFF (Backend For Frontend) resolvida dinamicamente para evitar bloqueios de rede privada (PNA)
  const [bffUrl, setBffUrl] = useState("http://localhost:3001");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const envUrl = process.env.NEXT_PUBLIC_BFF_URL;
      if (envUrl) {
        setBffUrl(envUrl);
      } else {
        setBffUrl(`http://${hostname}:3001`);
      }
    }
  }, []);

  // Busca as tarefas ao inicializar ou ao forçar atualização
  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      setError(null);
      try {
        const fetchUrl = refreshTrigger > 0 
          ? `${bffUrl}/api/tasks?bypassCache=true` 
          : `${bffUrl}/api/tasks`;
          
        const res = await fetch(fetchUrl);
        if (!res.ok) {
          throw new Error(`Servidor BFF retornou status ${res.status}`);
        }
        const data = await res.json();
        setTasks(data.tasks || []);
        setApiSource(data.source || "mock");
      } catch (err: any) {
        console.error("Erro ao conectar no BFF:", err);
        setError(
          "Não foi possível conectar ao servidor BFF. Verifique se o backend está ativo na porta 3001."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [refreshTrigger, bffUrl]);

  // Função para normalizar os diferentes tipos de status do ClickUp em 3 colunas padrão
  const getNormalizedColumn = (statusName: string): "todo" | "doing" | "done" => {
    if (!statusName) return "todo";
    // Remove acentos e caracteres especiais para comparação segura
    const status = statusName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");

    if (
      status.includes("todo") || 
      status.includes("backlog") || 
      status.includes("agendado") || 
      status.includes("planejado") || 
      status.includes("afazer") ||
      status.includes("pendente")
    ) {
      return "todo";
    }
    if (
      status.includes("doing") || 
      status.includes("progress") || 
      status.includes("emprogresso") || 
      status.includes("desenvolvimento") || 
      status.includes("execucao")
    ) {
      return "doing";
    }
    if (
      status.includes("done") || 
      status.includes("complete") || 
      status.includes("concluido") || 
      status.includes("finalizado") || 
      status.includes("entregue") ||
      status.includes("feito")
    ) {
      return "done";
    }
    return "todo"; // Fallback seguro
  };

  // Extrai lista única de todos os responsáveis/assignees presentes nas tarefas carregadas para o filtro
  const allAssignees = useMemo(() => {
    const map = new Map<number, string>();
    tasks.forEach(task => {
      task.assignees?.forEach(assignee => {
        if (assignee.username) {
          map.set(assignee.id, assignee.username);
        }
      });
    });
    return Array.from(map.entries()).map(([id, username]) => ({ id, username }));
  }, [tasks]);

  // Filtra as tarefas baseando-se no texto de busca e no responsável selecionado
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchText = 
        task.name.toLowerCase().includes(filterText.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(filterText.toLowerCase()));
      
      let matchAssignee = true;
      if (filterAssignee !== "all") {
        if (filterAssignee === "unassigned") {
          matchAssignee = !task.assignees || task.assignees.length === 0;
        } else {
          matchAssignee = task.assignees?.some(a => String(a.id) === filterAssignee) || false;
        }
      }

      return matchText && matchAssignee;
    });
  }, [tasks, filterText, filterAssignee]);

  // Cálculos da Visão Analítica (Métricas do Topo) baseadas nas tarefas ATUAIS carregadas
  const metrics = useMemo(() => {
    const total = filteredTasks.length;
    const critical = filteredTasks.filter(t => t.status_critico).length;
    const completed = filteredTasks.filter(t => getNormalizedColumn(t.status.status) === "done").length;
    
    return { total, critical, completed };
  }, [filteredTasks]);

  // Divide as tarefas filtradas nas 3 colunas Kanban
  const kanbanColumns = useMemo(() => {
    const todoList = filteredTasks.filter(t => getNormalizedColumn(t.status.status) === "todo");
    const doingList = filteredTasks.filter(t => getNormalizedColumn(t.status.status) === "doing");
    const doneList = filteredTasks.filter(t => getNormalizedColumn(t.status.status) === "done");

    return {
      todo: todoList,
      doing: doingList,
      done: doneList
    };
  }, [filteredTasks]);

  // Formata o timestamp de atualização em uma descrição amigável de tempo relativo
  const formatTimeAgo = (timestampStr: string) => {
    const timestamp = Number(timestampStr);
    if (isNaN(timestamp)) return "Data inválida";
    
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours <= 0) return "Atualizado recentemente";
      return `Atualizado há ${diffHours}h`;
    }
    if (diffDays === 1) return "Atualizado ontem";
    return `Atualizado há ${diffDays} dias`;
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* 1. CABEÇALHO DA APLICAÇÃO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-md tracking-wider">
              BFF PATTERN
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Fonte: </span>
              <span className={`font-semibold capitalize ${
                apiSource.includes("mock") ? "text-amber-400" : "text-emerald-400"
              }`}>
                {apiSource === "mock" ? "Ambiente Mock (Local)" : apiSource === "api" ? "ClickUp Live (Real)" : "ClickUp Cache (5m)"}
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
            Project <span className="text-indigo-400">Pulse</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Visão estratégica consolidada de gargalos operacionais da Dizevolv Tech. Dados tratados em tempo real no servidor BFF.
          </p>
        </div>

        <button 
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:text-slate-500 font-medium text-sm px-4 py-2.5 rounded-lg border border-slate-700 transition duration-150 cursor-pointer shadow-md disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Recarregar Painel
        </button>
      </header>

      {/* ERROR CARD */}
      {error && (
        <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-5 mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5 md:mt-0" />
            <div>
              <h3 className="font-bold text-red-200">Falha na Comunicação</h3>
              <p className="text-sm text-red-300/90 mt-0.5">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="bg-red-900 hover:bg-red-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            Tentar Conectar
          </button>
        </div>
      )}

      {/* 2. BLOCO ANALÍTICO DO TOPO (Métricas Executivas) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8" aria-label="Métricas Executivas">
        {/* Card 1: Total */}
        <div className="glass-panel rounded-xl p-6 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <Layers className="w-16 h-16 text-indigo-400" />
          </div>
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">
            Total de Demandas
          </p>
          <div className="flex items-baseline gap-2 mt-3">
            {loading ? (
              <div className="h-9 w-16 bg-slate-800 animate-pulse rounded"></div>
            ) : (
              <span className="text-4xl font-extrabold text-white">{metrics.total}</span>
            )}
            <span className="text-xs text-slate-500">filtradas</span>
          </div>
          <p className="text-xs text-slate-400 mt-2.5 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            Tarefas totais ativas na coluna Kanban.
          </p>
        </div>

        {/* Card 2: Críticas (Destaque Vermelho Pulsante) */}
        <div className="glass-panel rounded-xl p-6 relative overflow-hidden group border-red-500/20 shadow-lg bg-red-950/5">
          {metrics.critical > 0 && !loading && (
            <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>
          )}
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
          <p className="text-xs font-bold text-red-400 tracking-wider uppercase flex items-center gap-1.5">
            Gargalos Críticos
            {metrics.critical > 0 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </p>
          <div className="flex items-baseline gap-2 mt-3">
            {loading ? (
              <div className="h-9 w-16 bg-slate-800 animate-pulse rounded"></div>
            ) : (
              <span className="text-4xl font-extrabold text-red-500">{metrics.critical}</span>
            )}
            <span className="text-xs text-red-400/70">atenção imediata</span>
          </div>
          <p className="text-xs text-red-300/80 mt-2.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            Urgentes ou estagnadas há mais de 3 dias.
          </p>
        </div>

        {/* Card 3: Concluídas (Calm Green) */}
        <div className="glass-panel rounded-xl p-6 relative overflow-hidden group border-emerald-500/20 shadow-lg bg-emerald-950/5">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
            Demandas Concluídas
          </p>
          <div className="flex items-baseline gap-2 mt-3">
            {loading ? (
              <div className="h-9 w-16 bg-slate-800 animate-pulse rounded"></div>
            ) : (
              <span className="text-4xl font-extrabold text-emerald-500">{metrics.completed}</span>
            )}
            <span className="text-xs text-emerald-500/70">finalizadas</span>
          </div>
          <p className="text-xs text-emerald-300/80 mt-2.5 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Taxa de entrega: {loading ? "0" : metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}% concluído.
          </p>
        </div>
      </section>

      {/* 3. FILTROS RÁPIDOS */}
      <section className="glass-panel rounded-xl p-5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-md" aria-label="Filtros e Controles">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-400 text-sm pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-150"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <User className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Responsável:</span>
          </div>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="w-full sm:w-48 bg-slate-900 border border-slate-700 text-slate-200 text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 transition duration-150 cursor-pointer"
          >
            <option value="all">Todos os Membros</option>
            <option value="unassigned">Sem Responsável</option>
            {allAssignees.map(member => (
              <option key={member.id} value={member.id}>
                {member.username}
              </option>
            ))}
          </select>

          {(filterText || filterAssignee !== "all") && (
            <button 
              onClick={() => {
                setFilterText("");
                setFilterAssignee("all");
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline shrink-0"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </section>

      {/* 4. KANBAN BOARD */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
        {/* COLUNA: TO DO */}
        <section className="flex flex-col bg-slate-950/40 rounded-xl border border-slate-800 p-4 h-full min-h-[500px]" aria-label="Coluna To Do">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">A Fazer</h2>
            </div>
            <span className="bg-slate-900 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-md border border-slate-800">
              {loading ? "..." : kanbanColumns.todo.length}
            </span>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {loading ? (
              <CardSkeleton />
            ) : kanbanColumns.todo.length === 0 ? (
              <EmptyState />
            ) : (
              kanbanColumns.todo.map(task => <TaskCard key={task.id} task={task} formatTimeAgo={formatTimeAgo} column="todo" />)
            )}
          </div>
        </section>

        {/* COLUNA: DOING */}
        <section className="flex flex-col bg-slate-950/40 rounded-xl border border-slate-800 p-4 h-full min-h-[500px]" aria-label="Coluna Doing">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Em Execução</h2>
            </div>
            <span className="bg-slate-900 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-md border border-slate-800">
              {loading ? "..." : kanbanColumns.doing.length}
            </span>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {loading ? (
              <CardSkeleton />
            ) : kanbanColumns.doing.length === 0 ? (
              <EmptyState />
            ) : (
              kanbanColumns.doing.map(task => <TaskCard key={task.id} task={task} formatTimeAgo={formatTimeAgo} column="doing" />)
            )}
          </div>
        </section>

        {/* COLUNA: DONE */}
        <section className="flex flex-col bg-slate-950/40 rounded-xl border border-slate-800 p-4 h-full min-h-[500px]" aria-label="Coluna Done">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Concluído</h2>
            </div>
            <span className="bg-slate-900 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-md border border-slate-800">
              {loading ? "..." : kanbanColumns.done.length}
            </span>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {loading ? (
              <CardSkeleton />
            ) : kanbanColumns.done.length === 0 ? (
              <EmptyState />
            ) : (
              kanbanColumns.done.map(task => <TaskCard key={task.id} task={task} formatTimeAgo={formatTimeAgo} column="done" />)
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

/* COMPONENTE: CARD DA TAREFA */
function TaskCard({ 
  task, 
  formatTimeAgo, 
  column 
}: { 
  task: Task; 
  formatTimeAgo: (t: string) => string;
  column: "todo" | "doing" | "done";
}) {
  const isUrgentPriority = task.priority?.priority?.toLowerCase() === "urgent";

  return (
    <article 
      className={`bg-[#111420] border rounded-xl p-5 relative transition duration-200 hover:scale-[1.01] hover:border-slate-600 shadow-md ${
        task.status_critico 
          ? "border-red-500/40 critical-card-glow hover:border-red-500" 
          : "border-slate-800 hover:bg-[#151928]"
      }`}
    >
      {/* Badge Superior de Criticidade */}
      {task.status_critico && (
        <div className="flex items-center gap-1 text-[10px] font-extrabold bg-red-950/60 text-red-400 border border-red-500/30 px-2 py-1 rounded-md mb-3.5 uppercase tracking-wider w-fit">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            {task.criticidade_detalhes?.isUrgent 
              ? "Urgente" 
              : `Estagnado (${task.criticidade_detalhes?.diasSemAtualizar} dias)`}
          </span>
        </div>
      )}

      {/* Título da Demanda */}
      <h3 className="font-semibold text-slate-100 text-sm leading-snug tracking-tight mb-2">
        {task.name}
      </h3>

      {/* Descrição Curta */}
      {task.description ? (
        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
          {task.description}
        </p>
      ) : (
        <p className="text-slate-500 text-xs italic mb-4">Sem descrição detalhada.</p>
      )}

      {/* Prazo de Vencimento Badge */}
      {task.due_date && (() => {
        const badge = formatDueDate(task.due_date, column);
        if (!badge) return null;
        return (
          <div className={`flex items-center gap-1.5 text-[10px] font-bold border px-2.5 py-1 rounded-lg w-fit mb-4 ${badge.colorClass}`}>
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{badge.text}</span>
          </div>
        );
      })()}

      {/* Rodapé do Card */}
      <div className="flex items-center justify-between pt-3.5 border-t border-slate-800/80 gap-3">
        {/* Indicadores de Tempo */}
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{formatTimeAgo(task.date_updated)}</span>
        </div>

        {/* Avatares dos Responsáveis */}
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {task.assignees && task.assignees.length > 0 ? (
            task.assignees.map(assignee => (
              <div 
                key={assignee.id}
                title={`Responsável: ${assignee.username}`}
                style={{ backgroundColor: assignee.color || "#4f46e5" }}
                className="w-5.5 h-5.5 rounded-full border border-[#111420] flex items-center justify-center text-[9px] font-extrabold text-white uppercase shrink-0"
              >
                {assignee.initials}
              </div>
            ))
          ) : (
            <div 
              title="Sem responsável designado"
              className="w-5.5 h-5.5 rounded-full border border-[#111420] bg-slate-800 flex items-center justify-center text-[9px] text-slate-500 shrink-0"
            >
              <User className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/* COMPONENTE: ESQUELETO DE CARREGAMENTO (SKELETON SCREEN) */
function CardSkeleton() {
  return (
    <>
      {[1, 2].map((i) => (
        <div 
          key={i} 
          className="bg-[#111420]/50 border border-slate-900 rounded-xl p-5 space-y-4 animate-pulse"
        >
          <div className="h-4 bg-slate-800 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-800 rounded w-full"></div>
            <div className="h-3 bg-slate-800 rounded w-5/6"></div>
          </div>
          <div className="pt-3 border-t border-slate-900/60 flex justify-between items-center">
            <div className="h-3 bg-slate-800 rounded w-1/4"></div>
            <div className="w-6 h-6 rounded-full bg-slate-800"></div>
          </div>
        </div>
      ))}
    </>
  );
}

/* COMPONENTE: ESTADO DE COLUNA VAZIA */
function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/10">
      <ListTodo className="w-8 h-8 text-slate-600 mb-2.5" />
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
        Sem Tarefas
      </p>
      <p className="text-slate-500 text-[11px] text-center mt-1 max-w-[200px]">
        Nenhuma demanda corresponde aos filtros ativos nesta coluna.
      </p>
    </div>
  );
}

/* FUNÇÃO AUXILIAR: FORMATAÇÃO DE DATA DE VENCIMENTO COM CORES DINÂMICAS */
function formatDueDate(timestampStr: string | null, statusColumn: "todo" | "doing" | "done") {
  if (!timestampStr) return null;
  const timestamp = Number(timestampStr);
  if (isNaN(timestamp)) return null;

  const now = Date.now();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(timestamp);
  const dueDateClean = new Date(timestamp);
  dueDateClean.setHours(0, 0, 0, 0);

  const diffTime = dueDateClean.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const dateFormatted = dueDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  if (statusColumn === "done") {
    return { text: `Prazo: ${dateFormatted}`, colorClass: "text-slate-500 bg-slate-900 border-slate-800/80" };
  }

  if (diffDays < 0) {
    const absoluteDays = Math.abs(diffDays);
    return { 
      text: `Atrasada há ${absoluteDays} ${absoluteDays === 1 ? "dia" : "dias"} (${dateFormatted})`, 
      colorClass: "text-red-400 bg-red-950/30 border-red-500/25 animate-pulse" 
    };
  }
  if (diffDays === 0) {
    return { text: `Vence Hoje (${dateFormatted})`, colorClass: "text-amber-400 bg-amber-950/30 border-amber-500/30 font-bold" };
  }
  if (diffDays === 1) {
    return { text: `Vence Amanhã (${dateFormatted})`, colorClass: "text-indigo-400 bg-indigo-950/30 border-indigo-500/20" };
  }
  return { text: `Vence em ${diffDays} dias (${dateFormatted})`, colorClass: "text-slate-400 bg-slate-900 border-slate-800/80" };
}
