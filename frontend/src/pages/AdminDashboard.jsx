import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import CampeonatosTab from './CampeonatosTab';
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


function AdminDashboard({ user, logout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data collections for CRUDs
  const [alunos, setAlunos] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [fluxoCaixa, setFluxoCaixa] = useState([]);

  const [alunoForm, setAlunoForm] = useState({ id: null, name: '', responsavel_id: '', birth_date: '', status: 'active', medical_notes: '', photo: '', turma_ids: [], mensalidade_valor: 120, dia_vencimento: 10 });
  const [responsavelForm, setResponsavelForm] = useState({ id: null, name: '', email: '', password: '', phone: '', cpf: '' });
  const [turmaForm, setTurmaForm] = useState({ id: null, name: '', schedule: '', professor_id: '' });
  const [professorForm, setProfessorForm] = useState({ id: null, name: '', email: '', password: '' });
  const [produtoForm, setProdutoForm] = useState({ id: null, name: '', price: '', stock_quantity: '' });
  const [fluxoForm, setFluxoForm] = useState({ type: 'expense', description: '', amount: '', date: new Date().toISOString().split('T')[0] });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState({
    aluno: false,
    responsavel: false,
    turma: false,
    professor: false,
    produto: false,
    fluxo: false,
    avaliacao: false,
    historicoPagamento: false
  });

  const [historicoAluno, setHistoricoAluno] = useState(null);
  const [historicoData, setHistoricoData] = useState([]);

  // Special feature forms
  const [chamadaState, setChamadaState] = useState({ turma_id: '', date: new Date().toISOString().split('T')[0], Alunos: [] });
  const [avaliacaoForm, setAvaliacaoForm] = useState({ aluno_id: '', passe: 5, chute: 5, dominio: 5, condicionamento: 5, disciplina: 5, parecer: '', date: new Date().toISOString().split('T')[0] });
  const [settingsForm, setSettingsForm] = useState({ juros_mensal: '1.00', multa_atraso: '2.00' });
  const [mensalidadesList, setMensalidadesList] = useState([]);
  const [mensalidadeFilter, setMensalidadeFilter] = useState('');
  
  // Avaliações History
  const [avaliacoesList, setAvaliacoesList] = useState([]);
  const [avaliacaoFilterTurma, setAvaliacaoFilterTurma] = useState('');
  const [avaliacaoFilterAluno, setAvaliacaoFilterAluno] = useState('');

  // Sale PDV form
  const [vendaForm, setVendaForm] = useState({ produto_id: '', quantity: 1 });

  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role === 'responsavel') {
      navigate('/login');
      return;
    }
    fetchDashboardData();
    fetchAllData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard');
      setDashboardData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [alunosRes, respRes, turmasRes, profsRes, prodsRes, fluxoRes, mensRes, settingsRes] = await Promise.all([
        api.get('/alunos'),
        api.get('/responsaveis'),
        api.get('/turmas'),
        api.get('/professores'),
        api.get('/produtos'),
        api.get('/fluxo-caixa'),
        api.get('/mensalidades'),
        api.get('/settings'),
      ]);
      setAlunos(alunosRes.data);
      setResponsaveis(respRes.data);
      setTurmas(turmasRes.data);
      setProfessores(profsRes.data);
      setProdutos(prodsRes.data);
      setFluxoCaixa(fluxoRes.data);
      setMensalidadesList(mensRes.data);
      if (settingsRes && settingsRes.data) {
         setSettingsForm({
            juros_mensal: settingsRes.data.juros_mensal || '1.00',
            multa_atraso: settingsRes.data.multa_atraso || '2.00'
         });
      }

      if (turmasRes.data.length > 0) {
        setChamadaState(prev => ({ ...prev, turma_id: turmasRes.data[0].id }));
        fetchChamadaAlunos(turmasRes.data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenHistorico = async (aluno) => {
    try {
      const res = await api.get(`/alunos/${aluno.id}/mensalidades`);
      setHistoricoData(res.data);
      setHistoricoAluno(aluno);
      setIsModalOpen({ ...isModalOpen, historicoPagamento: true });
    } catch (e) {
      alert('Erro ao carregar histórico');
    }
  };

  const fetchChamadaAlunos = async (turmaId, dateVal) => {
    const dVal = dateVal || chamadaState.date;
    if (!turmaId) return;
    try {
      const res = await api.get(`/chamada?turma_id=${turmaId}&date=${dVal}`);
      setChamadaState(prev => ({ ...prev, Alunos: res.data.alunos, date: dVal, turma_id: turmaId }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ==========================================
  // ALUNO CRUD HANDLERS
  // ==========================================
  const handleSaveAluno = async (e) => {
    e.preventDefault();
    try {
      if (alunoForm.id) {
        await api.put(`/alunos/${alunoForm.id}`, alunoForm);
      } else {
        await api.post('/alunos', alunoForm);
      }
      setAlunoForm({ id: null, name: '', responsavel_id: '', birth_date: '', status: 'active', medical_notes: '', photo: '', turma_ids: [], mensalidade_valor: 120, dia_vencimento: 10 });
      fetchAllData();
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao salvar aluno');
    }
  };

  const handleEditAluno = (a) => {
    setAlunoForm({
      id: a.id,
      name: a.name,
      responsavel_id: a.responsavel_id,
      birth_date: a.birth_date,
      status: a.status,
      medical_notes: a.medical_notes || '',
      photo: a.photo_path || '',
      turma_ids: a.turmas.map(t => t.id),
      mensalidade_valor: a.mensalidade_valor || 120,
      dia_vencimento: a.dia_vencimento || 10
    });
  };

  const handleDeleteAluno = async (id) => {
    if (!confirm('Deseja realmente excluir este aluno?')) return;
    try {
      await api.delete(`/alunos/${id}`);
      fetchAllData();
      fetchDashboardData();
    } catch (e) {
      alert('Erro ao excluir aluno');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAlunoForm(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // RESPONSAVEL CRUD HANDLERS
  // ==========================================
  const handleSaveResponsavel = async (e) => {
    e.preventDefault();
    try {
      if (responsavelForm.id) {
        await api.put(`/responsaveis/${responsavelForm.id}`, responsavelForm);
      } else {
        await api.post('/responsaveis', responsavelForm);
      }
      setResponsavelForm({ id: null, name: '', email: '', password: '', phone: '', cpf: '' });
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao salvar responsável');
    }
  };

  const handleEditResponsavel = (r) => {
    setResponsavelForm({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      cpf: r.cpf,
      password: ''
    });
  };

  const handleDeleteResponsavel = async (id) => {
    if (!confirm('Deseja realmente excluir este responsável?')) return;
    try {
      await api.delete(`/responsaveis/${id}`);
      fetchAllData();
    } catch (e) {
      alert(err.response?.data?.message || 'Erro ao excluir responsável');
    }
  };

  // ==========================================
  // SETTINGS HANDLER
  // ==========================================
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.post('/settings', settingsForm);
      alert('Configurações salvas com sucesso!');
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao salvar configurações');
    }
  };

  // ==========================================
  // TURMA CRUD HANDLERS
  // ==========================================
  const handleSaveTurma = async (e) => {
    e.preventDefault();
    try {
      if (turmaForm.id) {
        await api.put(`/turmas/${turmaForm.id}`, turmaForm);
      } else {
        await api.post('/turmas', turmaForm);
      }
      setTurmaForm({ id: null, name: '', schedule: '', professor_id: '' });
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao salvar turma');
    }
  };

  const handleEditTurma = (t) => {
    setTurmaForm({
      id: t.id,
      name: t.name,
      schedule: t.schedule,
      professor_id: t.professor_id
    });
  };

  const handleDeleteTurma = async (id) => {
    if (!confirm('Deseja realmente excluir esta turma?')) return;
    try {
      await api.delete(`/turmas/${id}`);
      fetchAllData();
    } catch (e) {
      alert('Erro ao excluir turma');
    }
  };

  // ==========================================
  // PROFESSOR CRUD HANDLERS
  // ==========================================
  const handleSaveProfessor = async (e) => {
    e.preventDefault();
    try {
      if (professorForm.id) {
        await api.put(`/professores/${professorForm.id}`, professorForm);
      } else {
        await api.post('/professores', professorForm);
      }
      setProfessorForm({ id: null, name: '', email: '', password: '' });
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao salvar professor');
    }
  };

  const handleEditProfessor = (p) => {
    setProfessorForm({
      id: p.id,
      name: p.name,
      email: p.email,
      password: ''
    });
  };

  const handleDeleteProfessor = async (id) => {
    if (!confirm('Deseja realmente excluir este professor?')) return;
    try {
      await api.delete(`/professores/${id}`);
      fetchAllData();
    } catch (e) {
      alert('Erro ao excluir professor');
    }
  };

  // ==========================================
  // ATTENDANCE (CHAMADA) SAVE
  // ==========================================
  const handleSaveChamada = async () => {
    try {
      const chamadaObj = {};
      chamadaState.Alunos.forEach(al => {
        chamadaObj[al.id] = al.status;
      });
      await api.post('/chamada', {
        turma_id: chamadaState.turma_id,
        date: chamadaState.date,
        chamada: chamadaObj
      });
      alert('Chamada registrada com sucesso!');
    } catch (e) {
      alert('Erro ao salvar chamada');
    }
  };

  const handleTogglePresenca = (alunoId) => {
    setChamadaState(prev => {
      const updated = prev.Alunos.map(a => {
        if (a.id === alunoId) {
          return { ...a, status: a.status === 'present' ? 'absent' : 'present' };
        }
        return a;
      });
      return { ...prev, Alunos: updated };
    });
  };

  // ==========================================
  // ASSESSMENT (AVALIAÇÃO) SAVE
  // ==========================================
  const handleSaveAvaliacao = async (e) => {
    e.preventDefault();
    if (!avaliacaoForm.aluno_id) {
      alert('Selecione um aluno');
      return;
    }
    try {
      await api.post('/avaliacoes', avaliacaoForm);
      alert('Ficha de avaliação técnica registrada com sucesso!');
      setAvaliacaoForm({ aluno_id: '', passe: 5, chute: 5, dominio: 5, condicionamento: 5, disciplina: 5, parecer: '', date: new Date().toISOString().split('T')[0] });
    } catch (e) {
      alert('Erro ao salvar avaliação');
    }
  };

  // ==========================================
  // FINANCE & BILLING HANDLERS
  // ==========================================
  const handleGerarMensalidades = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/mensalidades/gerar', mensalidadeGerarForm);
      alert(res.data.message);
      fetchAllData();
      fetchDashboardData();
    } catch (e) {
      alert('Erro ao gerar mensalidades');
    }
  };

  const handleBaixaManual = async (id) => {
    if (!confirm('Deseja realmente dar baixa manual nesta mensalidade?')) return;
    try {
      await api.post(`/mensalidades/${id}/baixa`);
      fetchAllData();
      fetchDashboardData();
    } catch (e) {
      alert('Erro ao processar baixa');
    }
  };

  // ==========================================
  // LOJA / PDV HANDLERS
  // ==========================================
  const handleSaveProduto = async (e) => {
    e.preventDefault();
    try {
      if (produtoForm.id) {
        await api.put(`/produtos/${produtoForm.id}`, produtoForm);
      } else {
        await api.post('/produtos', produtoForm);
      }
      setProdutoForm({ id: null, name: '', price: '', stock_quantity: '' });
      fetchAllData();
    } catch (err) {
      alert('Erro ao salvar produto');
    }
  };

  const handleVendaProduto = async (e) => {
    e.preventDefault();
    if (!vendaForm.produto_id) return;
    try {
      await api.post('/produtos/vender', vendaForm);
      alert('Venda registrada com sucesso!');
      setVendaForm({ produto_id: '', quantity: 1 });
      fetchAllData();
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao realizar venda');
    }
  };

  // ==========================================
  // FLUXO DE CAIXA MANUAL
  // ==========================================
  const handleSaveFluxo = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fluxo-caixa', fluxoForm);
      setFluxoForm({ type: 'expense', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
      fetchAllData();
      fetchDashboardData();
      alert('Transação lançada com sucesso!');
    } catch (e) {
      alert('Erro ao lançar fluxo de caixa');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white font-bold animate-pulse text-lg">
        Carregando painel de controle...
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  const renderActiveTab = () => {
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
          <img src="/logo_sistema.jpg" alt="Logo" className="w-10 h-10 object-contain hidden sm:inline-block rounded-xl border border-slate-700 shadow-sm" />
          <h1 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            ESCOLA PARANÁ CLUBE BRASIL
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

        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-1.5 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center ${activeTab === tab.id ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
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
