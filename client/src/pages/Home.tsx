import { ChatWidget } from "@/components/ChatWidget";
import { Sparkles, Zap, Calendar, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            {/* Brand */}
            <div className="mb-4">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                Verzel
              </h1>
            </div>

            {/* Main Headline */}
            <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
              Inovação que
              <span className="block bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                Transforma Negócios
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed">
              Converse com nosso assistente virtual inteligente e descubra como podemos impulsionar sua empresa com soluções tecnológicas de ponta.
            </p>

            {/* CTA Button */}
            <button
              onClick={() => {
                const chatButton = document.querySelector('[aria-label="Abrir chat"]') as HTMLButtonElement;
                chatButton?.click();
              }}
              className="group relative px-8 py-4 text-lg font-semibold text-white rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-cyan-600 to-green-500 transition-all duration-300 group-hover:scale-110"></div>
              <div className="relative flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Iniciar Conversa
                <Sparkles className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Atendimento Inteligente</h3>
                <p className="text-gray-300 leading-relaxed">
                  Assistente virtual disponível 24/7 para responder suas dúvidas e qualificar leads com precisão.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Agendamento Automático</h3>
                <p className="text-gray-300 leading-relaxed">
                  Agende reuniões em poucos cliques com integração direta ao Google Calendar.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Resultados Comprovados</h3>
                <p className="text-gray-300 leading-relaxed">
                  Gestão completa de leads no Pipefy com acompanhamento em tempo real.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300 font-medium">Certificada Great Place to Work</span>
            </div>
            <p className="text-gray-400 text-lg">
              Clique no ícone de chat no canto inferior direito para começar
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 border-t border-white/10">
          <div className="text-center text-gray-400">
            <p>© 2025 Verzel. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}

