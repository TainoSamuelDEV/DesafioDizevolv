"use client";

import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Shield, 
  Zap, 
  ArrowRight, 
  Layers, 
  Database,
  Cpu,
  Lock,
  Play
} from "lucide-react";
import Link from "next/link";

interface SlideData {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bullets: string[];
  accentText: string;
  badge: string;
}

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const slides: SlideData[] = [
    {
      badge: "MÉTODO",
      title: "Project Pulse",
      subtitle: "A Saúde Operacional da sua Empresa em Tempo Real",
      icon: <Sparkles className="w-12 h-12 text-[#FD520A] animate-pulse" />,
      bullets: [
        "Dashboard Executivo de Alta Fidelidade visual projetado sob medida.",
        "Desenvolvido em 4 pilares: Discovery ➡️ Define ➡️ Develop ➡️ Deliver.",
        "Informação instantânea e inteligência consultiva para diretores e CTOs."
      ],
      accentText: "A Dizevolv Tech transforma a frustração corporativa em software de alta performance."
    },
    {
      badge: "1. DISCOVERY",
      title: "O Gargalo Oculto",
      subtitle: "As Dores Silenciosas da Gestão de Demandas",
      icon: <Layers className="w-12 h-12 text-[#FD520A]" />,
      bullets: [
        "Inatividade Invisível: Demandas estagnadas há mais de 3 dias sem qualquer interação da equipe.",
        "Sobrecarga de Gestão: Líderes perdendo horas em planilhas densas para identificar gargalos operacionais.",
        "Vazamento de Chaves: Projetos expondo tokens de API e credenciais confidenciais no cliente (frontend).",
        "Rate Limiting Severo: Consultas repetitivas estourando limites de conexões e derrubando integrações."
      ],
      accentText: "A dor do negócio mapeada e tratada de forma cirúrgica antes de iniciar o código."
    },
    {
      badge: "2. DEFINE",
      title: "Project Pulse Dashboard",
      subtitle: "Fluidez Visual com o Design Phoenix Flow",
      icon: <Cpu className="w-12 h-12 text-[#FD520A]" />,
      bullets: [
        "Visual Glassmorphic: Colunas Kanban translúcidas com efeito jateado (backdrop-blur-md) de alta sofisticação.",
        "Sprint Metrics Bar: Resumo numérico no topo (Tarefas, Gargalos, Entregues) e barra de progresso horizontal dinâmica.",
        "Taxa de Entrega Dinâmica: Percentual geral de conclusão recalculado em tempo real.",
        "Filtros Rápidos Executivos: Busca instantânea por título, descrição ou membro responsável designado."
      ],
      accentText: "Inteligência, elegância corporativa e usabilidade de alto contraste em um único lugar."
    },
    {
      badge: "3. DEVELOP",
      title: "Arquitetura Segura BFF",
      subtitle: "Blindagem e Resiliência sob Padrão BFF (Express.js)",
      icon: <Lock className="w-12 h-12 text-[#FD520A]" />,
      bullets: [
        "Token Privado ClickUp Isolado: Credenciais oficiais protegidas no backend. Segurança absoluta contra vazamentos.",
        "Cache BFF de 5 Minutos: Mitiga Rate Limiting armazenando dados de forma segura na memória do servidor.",
        "Modo Mock Auto-Resiliente: Fallback inteligente que aciona o simulador autônomo caso as chaves estejam em branco no .env.",
        "Agrupamento de Subtasks: Backend agrupa subtarefas sob seus respectivos pais, otimizando o processamento."
      ],
      accentText: "Conectividade segura com ClickUp API e estabilidade robusta sob qualquer escala de dados."
    },
    {
      badge: "4. DELIVER",
      title: "Micro-interações de Alta Fidelidade",
      subtitle: "A Diferença de Soluções com Valor de Marca",
      icon: <Zap className="w-12 h-12 text-[#FD520A]" />,
      bullets: [
        "Border-Spin Glow: Borda neon em rotação contínua nos cartões críticos. Desativa sozinha quando a tarefa é movida para Concluído.",
        "Customização de Marca: Cores totalmente mapeadas em variáveis de CSS nativas (Tech Orange #FD520A).",
        "Dark Mode à Prova de Bugs: Regra Tailwind @custom-variant dark que impede preferências do SO de afetarem a UI.",
        "Acordeão de Subtarefas com Grid Animação: Transição de altura hardware-accelerated (grid-rows-[0fr] a [1fr]).",
        "Cores do ClickUp Integradas: Cores de status de colunas pintadas de acordo com as chaves oficiais da lista."
      ],
      accentText: "Uma experiência de usuário que gera orgulho e destaca o software de soluções comuns de mercado."
    },
    {
      badge: "PRÓXIMOS PASSOS",
      title: "Próximos Passos de Escala",
      subtitle: "Acelerando e Escalando a Performance Operacional",
      icon: <Play className="w-12 h-12 text-[#FD520A]" />,
      bullets: [
        "Alertas Ativos via n8n: Disparos automáticos no Slack sempre que uma tarefa ultrapassar 3 dias de inatividade.",
        "Analytics Histórico: Gráficos de Lead Time e Cycle Time acumulados para análises estatísticas sazonais.",
        "Discovery Custom Fields: Integração profunda com campos personalizados de horas estimadas e faturamento real.",
        "Orquestrador de Sprints: Histórico de Sprints passadas comparado à atual para medir velocidade e previsibilidade."
      ],
      accentText: "Escalabilidade desenhada para apoiar decisões estratégicas e expandir o valor do negócio."
    }
  ];

  const handleNext = () => {
    setDirection("next");
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setDirection("prev");
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  // Suporte a controle por teclado (Setas, Espaço, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col justify-between p-6 md:p-12 relative overflow-hidden font-sans">
      {/* Background Radiantes Sutis */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FD520A]/[0.05] rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FD520A]/[0.02] rounded-full blur-[150px]"></div>

      {/* Header */}
      <header className="flex justify-between items-center z-10 border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-3">
          <img src="dizevolv.svg" className="h-10 w-auto" alt="Dizevolv Logo" />
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs font-semibold text-white/50 tracking-widest uppercase">
            PITCH DE APRESENTAÇÃO
          </span>
          <Link 
            href="/"
            className="flex items-center gap-1.5 bg-[#FD520A] hover:bg-[#FD520A]/90 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-lg cursor-pointer"
          >
            <span>Ver Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Slide Content */}
      <main className="flex-1 flex items-center justify-center py-12 z-10 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full min-h-[400px]">
          {/* Esquerda: Informações Principais */}
          <div className="md:col-span-7 space-y-6 flex flex-col justify-center">
            {/* Badge */}
            <div className="inline-flex items-center bg-[#FD520A]/10 border border-[#FD520A]/20 text-[#FD520A] text-[10px] font-extrabold px-3 py-1.5 rounded-md tracking-widest uppercase w-fit">
              {slide.badge}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-white transition-all duration-300">
                {slide.title}
              </h2>
              <p className="text-lg md:text-xl font-medium text-white/70 leading-snug">
                {slide.subtitle}
              </p>
            </div>

            {/* Bullets com Animação */}
            <ul className="space-y-4 pt-2">
              {slide.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-white/60 leading-relaxed">
                  <div className="w-2.5 h-2.5 bg-[#FD520A] rounded-full shrink-0 mt-2" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Direita: Elemento de Destaque / Caixa Visual */}
          <div className="md:col-span-5 flex items-center justify-center">
            <div className="w-full max-w-[340px] aspect-square rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-[#FD520A]/30 transition-all duration-300">
              {/* Glow circular de fundo */}
              <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#FD520A]/[0.08] rounded-full blur-[40px] group-hover:bg-[#FD520A]/[0.15] transition-all duration-300"></div>

              {/* Ícone */}
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit shadow-inner">
                {slide.icon}
              </div>

              {/* Accent Text */}
              <div className="space-y-2 relative z-10">
                <div className="w-8 h-1 bg-[#FD520A] rounded-full"></div>
                <p className="text-sm font-semibold text-white/80 leading-relaxed italic">
                  "{slide.accentText}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Controles do Slide */}
      <footer className="flex flex-col sm:flex-row justify-between items-center z-10 border-t border-white/[0.08] pt-6 gap-4">
        {/* Marcador de Índice */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-extrabold text-white/50 tracking-wider">
            {String(currentSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <div className="flex gap-1.5">
            {slides.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  setDirection(idx > currentSlide ? "next" : "prev");
                  setCurrentSlide(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide ? "w-6 bg-[#FD520A]" : "w-1.5 bg-white/20 hover:bg-white/45"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Informações da Apresentação */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-white/30 tracking-wider uppercase">
          <span>USE SETAS OU ESPAÇO PARA NAVEGAR</span>
        </div>

        {/* Botões do Slide */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={handlePrev}
            className="flex items-center justify-center p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition cursor-pointer shadow-md"
            title="Slide anterior"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          
          <button 
            onClick={handleNext}
            className="flex items-center justify-center p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition cursor-pointer shadow-md"
            title="Próximo slide"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </footer>
    </div>
  );
}
