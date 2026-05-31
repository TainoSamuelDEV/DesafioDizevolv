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
  Database,
  Sun,
  Moon
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

interface StatusColor {
  status: string;
  color: string;
}

interface ListDetails {
  name: string;
  folder: string;
  space: string;
  statuses: StatusColor[];
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [listDetails, setListDetails] = useState<ListDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<string>("mock");
  const [filterText, setFilterText] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Sincroniza a classe .dark no elemento raiz <html> para alternância de temas CSS
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

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
        setListDetails(data.listDetails || null);
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

  // Retorna a cor exata do status configurado no ClickUp
  const getStatusColor = (columnType: "todo" | "doing" | "done", defaultColor: string) => {
    if (!listDetails || !listDetails.statuses) return defaultColor;
    const match = listDetails.statuses.find(s => {
      const norm = s.status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
      if (columnType === "todo") {
        return norm.includes("todo") || norm.includes("backlog") || norm.includes("agendado") || norm.includes("planejado") || norm.includes("afazer") || norm.includes("pendente");
      }
      if (columnType === "doing") {
        return norm.includes("doing") || norm.includes("progress") || norm.includes("emprogresso") || norm.includes("desenvolvimento") || norm.includes("execucao");
      }
      if (columnType === "done") {
        return norm.includes("done") || norm.includes("complete") || norm.includes("concluido") || norm.includes("finalizado") || norm.includes("entregue") || norm.includes("feito");
      }
      return false;
    });
    return match ? match.color : defaultColor;
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

  const doneColor = getStatusColor("done", "#10b981");

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* 1. CABEÇALHO DA APLICAÇÃO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-[var(--card-border)]">
        <div>
          
          {/* <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[var(--foreground)]/70 bg-[var(--card-bg)] border border-[var(--card-border)] px-2.5 py-1 rounded-md">
              <Database className="w-3.5 h-3.5 text-[var(--primary)]" />
              
              <span>Fonte: </span>
              <span className={`font-bold capitalize ${
                apiSource.includes("mock") ? "text-amber-500" : "text-emerald-500"
              }`}>
                {apiSource === "mock" ? "Ambiente Mock (Local)" : apiSource === "api" ? "ClickUp Live (Real)" : "ClickUp Cache (5m)"}
              </span>
            </div>
          </div> */}
          <img src="dizevolv.svg" className="h-15 w-auto mt-2 mb-8" alt="" />

          {/* Espaço / Pasta Hierarchy Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[var(--primary)] uppercase tracking-wider mt-4">
            <span>{listDetails ? listDetails.space : "Dizevolv Tech"}</span>
            <span className="text-[var(--foreground)]/30 font-extrabold">/</span>
            <span>{listDetails ? listDetails.folder : "Assessoria"}</span>
          </div>

          <h1 className="text-3xl font-extrabold text-[var(--foreground)] mt-1 tracking-tight">
            {listDetails ? listDetails.name : "Project Pulse"}
          </h1>
          <p className="text-sm text-[var(--foreground)]/70 mt-1 max-w-xl">
            Visão consolidada de gargalos operacionais e saúde produtiva tratados em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto self-end md:self-auto shrink-0">
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card-hover)] transition cursor-pointer shadow-md animate-none"
            title={theme === "light" ? "Mudar para modo escuro" : "Mudar para modo claro"}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-[var(--primary)]" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
          </button>

          <button 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            disabled={loading}
            className="flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-slate-300 disabled:text-slate-500 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition duration-150 cursor-pointer shadow-md disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Recarregar Painel
          </button>
        </div>
      </header>

      {/* ERROR CARD */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/50 rounded-xl p-5 mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5 md:mt-0" />
            <div>
              <h3 className="font-bold text-red-800 dark:text-red-200">Falha na Comunicação</h3>
              <p className="text-sm text-red-700 dark:text-red-300/90 mt-0.5">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            Tentar Conectar
          </button>
        </div>
      )}

      {/* 2. BLOCO ANALÍTICO DO TOPO (Métricas Executivas) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" aria-label="Métricas Executivas">
        {/* Card 1: Total */}
        <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--card-border)] custom-shadow flex flex-col transition-all duration-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[var(--primary-glow)] rounded-lg">
              <Layers className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <span className="text-slate-500 dark:text-slate-400 font-extrabold text-[10px] tracking-widest uppercase">Métricas Ativas</span>
          </div>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-9 w-16 bg-[var(--card-border)] animate-pulse rounded"></div>
            ) : (
              <span className="text-4xl font-black text-[var(--foreground)]">{metrics.total}</span>
            )}
            <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">Demandas</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 flex items-center gap-1.5 font-medium">
            <Info className="w-3.5 h-3.5 text-[var(--primary)]" />
            Tarefas totais ativas no quadro atual.
          </p>
        </div>

        {/* Card 2: Críticas (Destaque Vermelho Pulsante) */}
        <div className="bg-[var(--card-bg)] p-6 rounded-2xl border-l-4 border-l-red-500 border border-[var(--card-border)] custom-shadow flex flex-col transition-all duration-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-500/5 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-red-500 font-extrabold text-[10px] tracking-widest uppercase">Crítico</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-9 w-16 bg-[var(--card-border)] animate-pulse rounded"></div>
            ) : (
              <span className="text-4xl font-black text-red-500">{metrics.critical}</span>
            )}
            <span className="text-red-500 font-medium text-sm">Gargalo{metrics.critical === 1 ? "" : "s"}</span>
          </div>
          <p className="text-xs text-red-800 dark:text-red-200 mt-2.5 flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            Atenção imediata requerida. Urgentes ou estagnadas.
          </p>
        </div>

        {/* Card 3: Concluídas (Calm Green) */}
        <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--card-border)] custom-shadow flex flex-col transition-all duration-200">
          <div className="flex justify-between items-start mb-4">
            <div style={{ backgroundColor: `${doneColor}15` }} className="p-2 rounded-lg">
              <CheckCircle style={{ color: doneColor }} className="w-5 h-5" />
            </div>
            <span style={{ color: doneColor }} className="font-extrabold text-[10px] tracking-widest uppercase">Progresso</span>
          </div>
          <div className="flex items-baseline gap-2">
            {loading ? (
              <div className="h-9 w-16 bg-[var(--card-border)] animate-pulse rounded"></div>
            ) : (
              <span style={{ color: doneColor }} className="text-4xl font-black">{metrics.completed}</span>
            )}
            <span style={{ color: doneColor }} className="font-medium text-sm">Entregue{metrics.completed === 1 ? "" : "s"}</span>
          </div>
          <div className="w-full bg-[var(--column-bg)] h-1.5 rounded-full mt-3.5 overflow-hidden">
            <div style={{ width: `${loading ? 0 : metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}%`, backgroundColor: doneColor }} className="h-full rounded-full transition-all duration-300"></div>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-2.5 flex items-center gap-1.5 font-medium">
            <CheckCircle style={{ color: doneColor }} className="w-3.5 h-3.5 shrink-0" />
            Taxa de entrega: <span style={{ color: doneColor }} className="font-bold">{loading ? "0" : metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}%</span> concluído.
          </p>
        </div>
      </section>

      {/* 3. FILTROS RÁPIDOS */}
      <section className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm" aria-label="Filtros e Controles">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--foreground)]/40" />
          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--foreground)] placeholder-[var(--foreground)]/40 text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition duration-150 shadow-sm"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <User className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-xs font-bold text-[var(--foreground)]/70 uppercase tracking-wide">Responsável:</span>
          </div>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="w-full sm:w-48 bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--foreground)] text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[var(--primary)] transition duration-150 cursor-pointer shadow-sm"
          >
            <option value="all" className="bg-[var(--card-bg)] text-[var(--foreground)]">Todos os Membros</option>
            <option value="unassigned" className="bg-[var(--card-bg)] text-[var(--foreground)]">Sem Responsável</option>
            {allAssignees.map(member => (
              <option key={member.id} value={member.id} className="bg-[var(--card-bg)] text-[var(--foreground)]">
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
              className="text-xs text-[var(--primary)] hover:underline font-semibold cursor-pointer shrink-0"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </section>

      {/* 4. KANBAN BOARD */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
        {/* COLUNA: TO DO */}
        <section className="flex flex-col bg-[var(--column-bg)] backdrop-blur-md border border-[var(--column-border)] p-4 rounded-2xl shadow-sm gap-4" aria-label="Coluna To Do">
          <div className="flex justify-between items-center px-2 py-1">
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: getStatusColor("todo", "#f97316") }} className="w-1.5 h-6 rounded-full"></div>
              <h2 className="font-bold text-lg text-[var(--foreground)]">A Fazer</h2>
              <span className="bg-slate-200 dark:bg-slate-800 text-[var(--foreground)]/70 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border border-[var(--card-border)] shadow-sm">
                {loading ? "..." : kanbanColumns.todo.length}
              </span>
            </div>
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
        <section className="flex flex-col bg-[var(--column-bg)] backdrop-blur-md border border-[var(--column-border)] p-4 rounded-2xl shadow-sm gap-4" aria-label="Coluna Doing">
          <div className="flex justify-between items-center px-2 py-1">
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: getStatusColor("doing", "#facc15") }} className="w-1.5 h-6 rounded-full"></div>
              <h2 className="font-bold text-lg text-[var(--foreground)]">Em Execução</h2>
              <span className="bg-slate-200 dark:bg-slate-800 text-[var(--foreground)]/70 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border border-[var(--card-border)] shadow-sm">
                {loading ? "..." : kanbanColumns.doing.length}
              </span>
            </div>
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
        <section className="flex flex-col bg-[var(--column-bg)] backdrop-blur-md border border-[var(--column-border)] p-4 rounded-2xl shadow-sm gap-4" aria-label="Coluna Done">
          <div className="flex justify-between items-center px-2 py-1">
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: getStatusColor("done", "#10b981") }} className="w-1.5 h-6 rounded-full"></div>
              <h2 className="font-bold text-lg text-[var(--foreground)]">Concluído</h2>
              <span className="bg-slate-200 dark:bg-slate-800 text-[var(--foreground)]/70 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border border-[var(--card-border)] shadow-sm">
                {loading ? "..." : kanbanColumns.done.length}
              </span>
            </div>
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
  const isDone = column === "done";
  const isCritical = task.status_critico && !isDone;

  return (
    <article 
      className={`relative rounded-xl transition-all duration-200 hover:scale-[1.01] custom-shadow hover:shadow-md cursor-grab group overflow-hidden ${
        isDone ? "opacity-70 grayscale-[0.3]" : ""
      } ${
        isCritical 
          ? "p-[1.5px] bg-[var(--card-border)] critical-card-glow" 
          : "border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--foreground)]/30 hover:bg-[var(--card-hover)] p-5"
      }`}
    >
      {/* Elemento de Borda Rotativa Conic */}
      {isCritical && (
        <div 
          className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_30%,#ef4444_50%,transparent_70%)] animate-[spin_2s_linear_infinite]"
        ></div>
      )}

      {/* Conteúdo Interno do Card */}
      <div 
        className={isCritical ? "relative bg-[var(--card-bg)] rounded-[11px] p-5 w-full h-full flex flex-col bg-gradient-to-br from-[var(--card-bg)] to-red-500/[0.03]" : "flex flex-col w-full h-full"}
      >
        {/* Badge Superior de Criticidade */}
        {task.status_critico && !isDone && (
          <div className="flex items-center gap-1 text-[10px] font-extrabold bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 px-2.5 py-1 rounded mb-3 uppercase tracking-wider w-fit">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              {task.criticidade_detalhes?.isUrgent 
                ? "Urgente" 
                : `Estagnado (${task.criticidade_detalhes?.diasSemAtualizar} dias)`}
            </span>
          </div>
        )}

        {/* Título da Demanda */}
        <h3 className="font-bold text-[var(--foreground)] text-base mb-2 leading-snug tracking-tight">
          {task.name}
        </h3>

        {/* Descrição Curta */}
        {task.description ? (
          <p className="text-[var(--foreground)]/70 text-xs line-clamp-2 leading-relaxed mb-4">
            {task.description}
          </p>
        ) : (
          <p className="text-[var(--foreground)]/40 text-xs italic mb-4">Sem descrição detalhada.</p>
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
        <div className="flex items-center justify-between pt-3.5 border-t border-[var(--card-border)] gap-3 mt-auto">
          {/* Indicadores de Tempo */}
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--foreground)]/50">
            <Clock className="w-3 h-3 text-[var(--foreground)]/50" />
            <span>{formatTimeAgo(task.date_updated)}</span>
          </div>

          {/* Avatares dos Responsáveis */}
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            {task.assignees && task.assignees.length > 0 ? (
              task.assignees.map(assignee => (
                <div 
                  key={assignee.id}
                  title={`Responsável: ${assignee.username}`}
                  style={{ backgroundColor: assignee.color || "var(--primary)" }}
                  className="w-5.5 h-5.5 rounded-full border-2 border-[var(--card-bg)] flex items-center justify-center text-[9px] font-extrabold text-white uppercase shrink-0"
                >
                  {assignee.initials}
                </div>
              ))
            ) : (
              <div 
                title="Sem responsável designado"
                className="w-5.5 h-5.5 rounded-full border border-[var(--card-border)] bg-[var(--column-bg)] flex items-center justify-center text-[9px] text-[var(--foreground)]/50 shrink-0"
              >
                <User className="w-3 h-3" />
              </div>
            )}
          </div>
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
          className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 space-y-4 animate-pulse shadow-sm"
        >
          <div className="h-4 bg-[var(--column-border)] rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-[var(--column-border)] rounded w-full"></div>
            <div className="h-3 bg-[var(--column-border)] rounded w-5/6"></div>
          </div>
          <div className="pt-3 border-t border-[var(--card-border)] flex justify-between items-center">
            <div className="h-3 bg-[var(--column-border)] rounded w-1/4"></div>
            <div className="w-6 h-6 rounded-full bg-[var(--column-border)]"></div>
          </div>
        </div>
      ))}
    </>
  );
}

/* COMPONENTE: ESTADO DE COLUNA VAZIA */
function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 border border-dashed border-[var(--card-border)] rounded-xl bg-[var(--column-bg)]/20">
      <ListTodo className="w-8 h-8 text-[var(--foreground)]/30 mb-2.5" />
      <p className="text-[var(--foreground)]/70 text-xs font-semibold uppercase tracking-wider">
        Sem Tarefas
      </p>
      <p className="text-[var(--foreground)]/40 text-[11px] text-center mt-1 max-w-[200px]">
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
    return { text: `Prazo: ${dateFormatted}`, colorClass: "text-[var(--foreground)]/60 bg-[var(--column-bg)] border-[var(--card-border)]" };
  }

  if (diffDays < 0) {
    const absoluteDays = Math.abs(diffDays);
    return { 
      text: `Atrasada há ${absoluteDays} ${absoluteDays === 1 ? "dia" : "dias"} (${dateFormatted})`, 
      colorClass: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-500/25 animate-pulse" 
    };
  }
  if (diffDays === 0) {
    return { text: `Vence Hoje (${dateFormatted})`, colorClass: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/30 font-bold" };
  }
  if (diffDays === 1) {
    return { text: `Vence Amanhã (${dateFormatted})`, colorClass: "text-[var(--primary)] bg-[var(--primary-glow)] border-[var(--primary)]/20" };
  }
  return { text: `Vence em ${diffDays} dias (${dateFormatted})`, colorClass: "text-[var(--foreground)]/60 bg-[var(--column-bg)] border-[var(--card-border)]" };
}
