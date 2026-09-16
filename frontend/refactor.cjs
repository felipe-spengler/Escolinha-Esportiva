const fs = require('fs');
const file = 'd:/Área de Trabalho/escolinha esporte/frontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const importStatements = `
import OverviewTab from './tabs/OverviewTab';
import AlunosTab from './tabs/AlunosTab';
import ResponsaveisTab from './tabs/ResponsaveisTab';
import TurmasTab from './tabs/TurmasTab';
import ProfessoresTab from './tabs/ProfessoresTab';
import FinanceiroTab from './tabs/FinanceiroTab';
import LojaTab from './tabs/LojaTab';
import FluxoTab from './tabs/FluxoTab';
import AvaliacaoTab from './tabs/AvaliacaoTab';
import ChamadaTab from './tabs/ChamadaTab';
import AdminModals from './tabs/AdminModals';
`;
content = content.replace("import CampeonatosTab from './CampeonatosTab';", "import CampeonatosTab from './CampeonatosTab';" + importStatements);

const renderIndex = content.indexOf('const renderActiveTab = () => {');
const topPart = content.substring(0, renderIndex);

const newRender = `const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab dashboardData={dashboardData} />;
      case 'chamada': return <ChamadaTab turmas={turmas} chamadaState={chamadaState} fetchChamadaAlunos={fetchChamadaAlunos} handleTogglePresenca={handleTogglePresenca} handleSaveChamada={handleSaveChamada} />;
      case 'avaliacao': return <AvaliacaoTab turmas={turmas} alunos={alunos} avaliacoesList={avaliacoesList} avaliacaoFilterTurma={avaliacaoFilterTurma} setAvaliacaoFilterTurma={setAvaliacaoFilterTurma} avaliacaoFilterAluno={avaliacaoFilterAluno} setAvaliacaoFilterAluno={setAvaliacaoFilterAluno} setAvaliacaoForm={setAvaliacaoForm} setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} handleDeleteAvaliacao={handleDeleteAvaliacao} />;
      case 'alunos': return <AlunosTab alunos={alunos} isAdmin={isAdmin} setAlunoForm={setAlunoForm} setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} handleEditAluno={handleEditAluno} handleDeleteAluno={handleDeleteAluno} handleOpenHistorico={handleOpenHistorico} />;
      case 'responsaveis': return <ResponsaveisTab responsaveis={responsaveis} isAdmin={isAdmin} setResponsavelForm={setResponsavelForm} setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} handleEditResponsavel={handleEditResponsavel} handleDeleteResponsavel={handleDeleteResponsavel} />;
      case 'turmas': return <TurmasTab turmas={turmas} isAdmin={isAdmin} setTurmaForm={setTurmaForm} setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} handleEditTurma={handleEditTurma} handleDeleteTurma={handleDeleteTurma} />;
      case 'professores': return <ProfessoresTab professores={professores} isAdmin={isAdmin} setProfessorForm={setProfessorForm} setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} handleEditProfessor={handleEditProfessor} handleDeleteProfessor={handleDeleteProfessor} />;
      case 'financeiro': return <FinanceiroTab isAdmin={isAdmin} mensalidadeFilter={mensalidadeFilter} setMensalidadeFilter={setMensalidadeFilter} mensalidadesList={mensalidadesList} handleBaixaManual={handleBaixaManual} handleSaveSettings={handleSaveSettings} settingsForm={settingsForm} setSettingsForm={setSettingsForm} />;
      case 'loja': return <LojaTab isAdmin={isAdmin} setProdutoForm={setProdutoForm} setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} handleVendaProduto={handleVendaProduto} vendaForm={vendaForm} setVendaForm={setVendaForm} produtos={produtos} />;
      case 'campeonatos': return <CampeonatosTab alunos={alunos} isAdmin={isAdmin} />;
      case 'fluxo': return <FluxoTab fluxoCaixa={fluxoCaixa} isAdmin={isAdmin} setFluxoForm={setFluxoForm} setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AdminModals
        isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}
        historicoAluno={historicoAluno} historicoData={historicoData}
        produtoForm={produtoForm} setProdutoForm={setProdutoForm} handleSaveProduto={handleSaveProduto}
        fluxoForm={fluxoForm} setFluxoForm={setFluxoForm} handleSaveFluxo={handleSaveFluxo}
        avaliacaoForm={avaliacaoForm} setAvaliacaoForm={setAvaliacaoForm} handleSaveAvaliacao={handleSaveAvaliacao} alunos={alunos} turmas={turmas}
        professorForm={professorForm} setProfessorForm={setProfessorForm} handleSaveProfessor={handleSaveProfessor}
        alunoForm={alunoForm} setAlunoForm={setAlunoForm} handleSaveAluno={handleSaveAluno} responsaveis={responsaveis} handlePhotoUpload={handlePhotoUpload}
        turmaForm={turmaForm} setTurmaForm={setTurmaForm} handleSaveTurma={handleSaveTurma} professores={professores}
        responsavelForm={responsavelForm} setResponsavelForm={setResponsavelForm} handleSaveResponsavel={handleSaveResponsavel}
      />
      
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button className="lg:hidden text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="text-2xl hidden sm:inline-block">⚽</span>
          <h1 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            ARENA - GESTÃO ESPORTIVA
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-bold text-white">{user?.name}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user?.role === 'admin' ? 'Diretor Geral' : 'Professor'}</div>
          </div>
          <button onClick={handleLogout} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 transition-all">
            Sair
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row relative">
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}

        <aside className={\`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-1.5 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 overflow-y-auto \${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}\`}>
          {[
            { id: 'overview', label: '📊 Dashboard', roles: ['admin', 'professor'] },
            { id: 'chamada', label: '📝 Diário de Classe', roles: ['admin', 'professor'] },
            { id: 'avaliacao', label: '⭐ Ficha de Avaliação', roles: ['admin', 'professor'] },
            { id: 'alunos', label: '🏃 Gerenciar Alunos', roles: ['admin'] },
            { id: 'responsaveis', label: '👥 Pais / Responsáveis', roles: ['admin'] },
            { id: 'turmas', label: '🏫 Turmas', roles: ['admin'] },
            { id: 'professores', label: '👔 Professores', roles: ['admin'] },
            { id: 'campeonatos', label: '🏆 Campeonatos', roles: ['admin', 'professor'] },
            { id: 'financeiro', label: '💰 Mensalidades', roles: ['admin'] },
            { id: 'loja', label: '🛒 Loja / PDV', roles: ['admin'] },
            { id: 'fluxo', label: '📉 Fluxo de Caixa', roles: ['admin'] },
          ].filter(tab => tab.roles.includes(user.role)).map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
              className={\`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center \${activeTab === tab.id ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}\`}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
`;

fs.writeFileSync(file, topPart + newRender);
