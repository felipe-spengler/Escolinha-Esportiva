import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

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
    avaliacao: false
  });

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* MODAL COMPONENT (Global Wrapper) */}
      {Object.values(isModalOpen).some(Boolean) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen({ aluno: false, responsavel: false, turma: false, professor: false, produto: false, fluxo: false })} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen({ aluno: false, responsavel: false, turma: false, professor: false, produto: false, fluxo: false })}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors z-10"
            >
              ✕
            </button>
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {/* PRODUTO FORM MODAL */}
              {isModalOpen.produto && (
                <div>
                  <h3 className="text-lg font-black text-white mb-6">{produtoForm.id ? 'Editar Produto' : 'Adicionar Produto'}</h3>
                  <form onSubmit={(e) => { handleSaveProduto(e); setIsModalOpen({ ...isModalOpen, produto: false }); }} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nome do Produto</label>
                      <input type="text" value={produtoForm.name} onChange={(e) => setProdutoForm(prev => ({ ...prev, name: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Preço de Venda (R$)</label>
                      <input type="number" step="0.01" value={produtoForm.price} onChange={(e) => setProdutoForm(prev => ({ ...prev, price: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Quantidade em Estoque</label>
                      <input type="number" value={produtoForm.stock_quantity} onChange={(e) => setProdutoForm(prev => ({ ...prev, stock_quantity: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase">
                      Salvar
                    </button>
                  </form>
                </div>
              )}

              {/* FLUXO CAIXA FORM MODAL */}
              {isModalOpen.fluxo && (
                <div>
                  <h3 className="text-lg font-black text-white mb-6">Lançar Despesa / Receita</h3>
                  <form onSubmit={(e) => { handleSaveFluxo(e); setIsModalOpen({ ...isModalOpen, fluxo: false }); }} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Tipo de Lançamento</label>
                      <select value={fluxoForm.type} onChange={(e) => setFluxoForm(prev => ({ ...prev, type: e.target.value }))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm">
                        <option value="expense">Saída (Despesa)</option>
                        <option value="income">Entrada (Receita)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Descrição / Motivo</label>
                      <input type="text" value={fluxoForm.description} onChange={(e) => setFluxoForm(prev => ({ ...prev, description: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Valor (R$)</label>
                      <input type="number" step="0.01" value={fluxoForm.amount} onChange={(e) => setFluxoForm(prev => ({ ...prev, amount: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Data</label>
                      <input type="date" value={fluxoForm.date} onChange={(e) => setFluxoForm(prev => ({ ...prev, date: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase">
                      Lançar no Caixa
                    </button>
                  </form>
                </div>
              )}

              {/* AVALIACAO FORM MODAL */}
              {isModalOpen.avaliacao && (
                <div>
                  <h3 className="text-lg font-black text-white mb-6">{avaliacaoForm.id ? 'Editar Avaliação' : 'Registrar Avaliação'}</h3>
                  <form onSubmit={handleSaveAvaliacao} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Aluno</label>
                        <select
                          value={avaliacaoForm.aluno_id}
                          onChange={(e) => setAvaliacaoForm(prev => ({ ...prev, aluno_id: e.target.value }))}
                          required
                          className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm"
                        >
                          <option value="">Selecione...</option>
                          {alunos.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Data da Avaliação</label>
                        <input
                          type="date"
                          value={avaliacaoForm.date}
                          onChange={(e) => setAvaliacaoForm(prev => ({ ...prev, date: e.target.value }))}
                          required
                          className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-5 border-t border-slate-800/80 pt-6">
                      {[
                        { key: 'passe', label: 'Passe' },
                        { key: 'chute', label: 'Chute' },
                        { key: 'dominio', label: 'Domínio de Bola' },
                        { key: 'condicionamento', label: 'Condicionamento Físico' },
                        { key: 'disciplina', label: 'Disciplina e Postura' },
                      ].map((field) => (
                        <div key={field.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-850/50">
                          <span className="text-sm font-semibold text-slate-300">{field.label}</span>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={avaliacaoForm[field.key]}
                              onChange={(e) => setAvaliacaoForm(prev => ({ ...prev, [field.key]: parseInt(e.target.value) }))}
                              className="w-36 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <span className="font-bold text-emerald-400 w-6 text-right">{avaliacaoForm[field.key]}/10</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Parecer Descritivo</label>
                      <textarea
                        rows="3"
                        value={avaliacaoForm.parecer}
                        onChange={(e) => setAvaliacaoForm(prev => ({ ...prev, parecer: e.target.value }))}
                        placeholder="Descreva a evolução técnica, pontos fortes e fracos do aluno..."
                        className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all uppercase text-xs tracking-wider"
                    >
                      {avaliacaoForm.id ? 'Salvar Alterações' : 'Registrar Avaliação'}
                    </button>
                  </form>
                </div>
              )}

              {/* PROFESSOR FORM MODAL */}
              {isModalOpen.professor && (
                <div>
                  <h3 className="text-lg font-black text-white mb-6">{professorForm.id ? 'Editar Professor' : 'Cadastrar Professor'}</h3>
                  <form onSubmit={(e) => { handleSaveProfessor(e); setIsModalOpen({ ...isModalOpen, professor: false }); }} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nome Completo</label>
                      <input type="text" value={professorForm.name} onChange={(e) => setProfessorForm(prev => ({ ...prev, name: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">E-mail (Login)</label>
                      <input type="email" value={professorForm.email} onChange={(e) => setProfessorForm(prev => ({ ...prev, email: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Senha {professorForm.id && '(Deixe vazio para manter)'}</label>
                      <input type="password" value={professorForm.password} onChange={(e) => setProfessorForm(prev => ({ ...prev, password: e.target.value }))} required={!professorForm.id} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase">
                      {professorForm.id ? 'Salvar Alterações' : 'Cadastrar'}
                    </button>
                  </form>
                </div>
              )}

              {/* ALUNO FORM MODAL */}
              {isModalOpen.aluno && (
                <div>
                  <h3 className="text-lg font-black text-white mb-6">{alunoForm.id ? 'Editar Aluno' : 'Cadastrar Aluno'}</h3>
                  <form onSubmit={handleSaveAluno} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nome Completo</label>
                      <input type="text" value={alunoForm.name} onChange={(e) => setAlunoForm(prev => ({ ...prev, name: e.target.value }))} required placeholder="Nome do aluno" className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Data de Nascimento</label>
                      <input type="date" value={alunoForm.birth_date} onChange={(e) => setAlunoForm(prev => ({ ...prev, birth_date: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Responsável</label>
                      <select value={alunoForm.responsavel_id} onChange={(e) => setAlunoForm(prev => ({ ...prev, responsavel_id: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm">
                        <option value="">Selecione...</option>
                        {responsaveis.map(r => (<option key={r.id} value={r.id}>{r.name} ({r.cpf})</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Turmas</label>
                      <select multiple value={alunoForm.turma_ids} onChange={(e) => setAlunoForm(prev => ({ ...prev, turma_ids: Array.from(e.target.selectedOptions, option => parseInt(option.value)) }))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm min-h-24">
                        {turmas.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                      </select>
                      <span className="text-[10px] text-slate-500 mt-1 block">Segure Ctrl (ou Cmd) para selecionar mais de uma</span>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Ficha Médica</label>
                      <textarea rows="2" value={alunoForm.medical_notes} onChange={(e) => setAlunoForm(prev => ({ ...prev, medical_notes: e.target.value }))} placeholder="Alergias, restrições físicas, etc..." className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Foto (Arquivo)</label>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full bg-slate-950 border border-slate-850 text-slate-300 rounded-xl px-4 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20" />
                      {alunoForm.photo && alunoForm.photo.startsWith('data:image') && <p className="text-xs text-emerald-500 mt-1">✓ Imagem carregada</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Status</label>
                      <select value={alunoForm.status} onChange={(e) => setAlunoForm(prev => ({ ...prev, status: e.target.value }))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm">
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                        <option value="suspended">Suspenso</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Mensalidade (R$)</label>
                        <input type="number" step="0.01" value={alunoForm.mensalidade_valor} onChange={(e) => setAlunoForm(prev => ({ ...prev, mensalidade_valor: e.target.value }))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Vencimento</label>
                        <input type="number" min="1" max="31" value={alunoForm.dia_vencimento} onChange={(e) => setAlunoForm(prev => ({ ...prev, dia_vencimento: e.target.value }))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase" onClick={() => setIsModalOpen({ ...isModalOpen, aluno: false })}>
                      {alunoForm.id ? 'Salvar Alterações' : 'Cadastrar'}
                    </button>
                  </form>
                </div>
              )}

              {/* TURMA FORM MODAL */}
              {isModalOpen.turma && (
                <div>
                  <h3 className="text-lg font-black text-white mb-6">{turmaForm.id ? 'Editar Turma' : 'Cadastrar Turma'}</h3>
                  <form onSubmit={(e) => { handleSaveTurma(e); setIsModalOpen({ ...isModalOpen, turma: false }); }} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nome da Turma</label>
                      <input type="text" value={turmaForm.name} onChange={(e) => setTurmaForm(prev => ({ ...prev, name: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Horário / Dias</label>
                      <input type="text" value={turmaForm.schedule} onChange={(e) => setTurmaForm(prev => ({ ...prev, schedule: e.target.value }))} required placeholder="Ex: Seg/Qua 14:00" className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Professor</label>
                      <select value={turmaForm.professor_id} onChange={(e) => setTurmaForm(prev => ({ ...prev, professor_id: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm">
                        <option value="">Selecione...</option>
                        {professores.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase">
                      {turmaForm.id ? 'Salvar Alterações' : 'Cadastrar'}
                    </button>
                  </form>
                </div>
              )}
              {isModalOpen.responsavel && (
                <div>
                  <h3 className="text-lg font-black text-white mb-6">{responsavelForm.id ? 'Editar Responsável' : 'Cadastrar Responsável'}</h3>
                  <form onSubmit={(e) => { handleSaveResponsavel(e); setIsModalOpen({ ...isModalOpen, responsavel: false }); }} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nome Completo</label>
                      <input type="text" value={responsavelForm.name} onChange={(e) => setResponsavelForm(prev => ({ ...prev, name: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">E-mail</label>
                      <input type="email" value={responsavelForm.email} onChange={(e) => setResponsavelForm(prev => ({ ...prev, email: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Senha {responsavelForm.id ? '(Deixe em branco para manter)' : ''}</label>
                      <input type="password" value={responsavelForm.password} onChange={(e) => setResponsavelForm(prev => ({ ...prev, password: e.target.value }))} required={!responsavelForm.id} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Telefone</label>
                      <input type="text" value={responsavelForm.phone} onChange={(e) => setResponsavelForm(prev => ({ ...prev, phone: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">CPF</label>
                      <input type="text" value={responsavelForm.cpf} onChange={(e) => setResponsavelForm(prev => ({ ...prev, cpf: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase">
                      {responsavelForm.id ? 'Salvar Alterações' : 'Cadastrar'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button 
            className="lg:hidden text-slate-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
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
          <button
            onClick={handleLogout}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 transition-all"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row relative">
        
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* Sidebar Nav */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-1.5 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {[
            { id: 'overview', label: '📊 Dashboard', roles: ['admin', 'professor'] },
            { id: 'chamada', label: '📝 Diário de Classe', roles: ['admin', 'professor'] },
            { id: 'avaliacao', label: '⭐ Ficha de Avaliação', roles: ['admin', 'professor'] },
            { id: 'alunos', label: '🏃 Gerenciar Alunos', roles: ['admin'] },
            { id: 'responsaveis', label: '👥 Pais / Responsáveis', roles: ['admin'] },
            { id: 'turmas', label: '🏫 Turmas', roles: ['admin'] },
            { id: 'professores', label: '👔 Professores', roles: ['admin'] },
            { id: 'financeiro', label: '💰 Mensalidades', roles: ['admin'] },
            { id: 'loja', label: '🛒 Loja / PDV', roles: ['admin'] },
            { id: 'fluxo', label: '📉 Fluxo de Caixa', roles: ['admin'] },
          ].filter(tab => tab.roles.includes(user.role)).map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Main Workspace content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          
          {/* TAB: OVERVIEW / DASHBOARD */}
          {activeTab === 'overview' && dashboardData && (
            <div className="space-y-8">
              {/* Metrics cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 text-slate-800/20 text-7xl font-bold select-none pr-4 pb-2">RUN</div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Alunos Ativos</span>
                  <div className="text-4xl font-black text-emerald-400 mt-2">{dashboardData.total_alunos_ativos}</div>
                </div>
                
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 text-slate-800/20 text-7xl font-bold select-none pr-4 pb-2">DEB</div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Inadimplentes no Mês</span>
                  <div className="text-4xl font-black text-red-400 mt-2">{dashboardData.inadimplencia_mes}</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 text-slate-800/20 text-7xl font-bold select-none pr-4 pb-2">CAI</div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Finanças do Mês</span>
                  <div className="text-lg font-black text-emerald-400 mt-2">Rec: R$ {dashboardData.receitas_mes.toFixed(2)}</div>
                  <div className="text-lg font-black text-red-400">Desp: R$ {dashboardData.despesas_mes.toFixed(2)}</div>
                </div>
              </div>

              {/* Graphic and birthdates */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SVG Graph */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <h3 className="text-lg font-black text-white mb-6">Fluxo Financeiro (Histórico)</h3>
                  <div className="h-64 flex items-end justify-between gap-4 pt-6 border-b border-l border-slate-800 px-4">
                    {dashboardData.fluxo_historico.map((m, idx) => {
                      const maxVal = Math.max(...dashboardData.fluxo_historico.map(x => Math.max(x.receitas, x.despesas))) || 1;
                      const recPct = (m.receitas / maxVal) * 100;
                      const despPct = (m.despesas / maxVal) * 100;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                          <div className="flex gap-1.5 w-full items-end justify-center h-48">
                            <div className="bg-emerald-500 w-3.5 rounded-t-sm" style={{ height: `${recPct}%` }} title={`Receitas: R$ ${m.receitas.toFixed(2)}`} />
                            <div className="bg-red-500 w-3.5 rounded-t-sm" style={{ height: `${despPct}%` }} title={`Despesas: R$ ${m.despesas.toFixed(2)}`} />
                          </div>
                          <span className="text-slate-500 text-[10px] uppercase font-bold mt-2">{m.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-center gap-6 mt-4 text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-slate-400"><span className="w-3 h-3 bg-emerald-500 rounded-full inline-block" /> Receitas</span>
                    <span className="flex items-center gap-1.5 font-bold text-slate-400"><span className="w-3 h-3 bg-red-500 rounded-full inline-block" /> Despesas</span>
                  </div>
                </div>

                {/* Birthdates */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white mb-4">🎈 Aniversariantes do Mês</h3>
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {dashboardData.aniversariantes_mes.map(a => {
                        const date = new Date(a.birth_date);
                        return (
                          <div key={a.id} className="flex justify-between items-center bg-slate-950/40 px-4 py-3 rounded-2xl border border-slate-800/80">
                            <span className="font-bold text-white text-sm">{a.name}</span>
                            <span className="text-xs text-slate-400 font-semibold">{date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</span>
                          </div>
                        );
                      })}
                      {dashboardData.aniversariantes_mes.length === 0 && (
                        <div className="text-slate-500 text-sm py-12 text-center italic">Nenhum aniversariante neste mês.</div>
                      )}
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mt-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Aniversariantes do Dia:</h4>
                      <p className="text-slate-400 text-xs mt-1">
                        {dashboardData.aniversariantes_dia.length > 0
                          ? dashboardData.aniversariantes_dia.map(x => x.name).join(', ')
                          : 'Nenhum hoje.'
                        }
                      </p>
                    </div>
                    <span className="text-2xl">🍰</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CHAMADA / DIÁRIO DE CLASSE */}
          {activeTab === 'chamada' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl">
              <h3 className="text-xl font-black text-white mb-6">Chamada Diária</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Turma</label>
                  <select
                    value={chamadaState.turma_id}
                    onChange={(e) => fetchChamadaAlunos(e.target.value, chamadaState.date)}
                    className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm"
                  >
                    {turmas.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Data da Aula</label>
                  <input
                    type="date"
                    value={chamadaState.date}
                    onChange={(e) => fetchChamadaAlunos(chamadaState.turma_id, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-800/80 pt-6">
                {chamadaState.Alunos.map(a => (
                  <div key={a.id} className="flex justify-between items-center bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60">
                    <span className="text-white font-bold">{a.name}</span>
                    <button
                      onClick={() => handleTogglePresenca(a.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase ${
                        a.status === 'present'
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-600 shadow-md shadow-emerald-500/10'
                          : 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30'
                      }`}
                    >
                      {a.status === 'present' ? 'Presente' : 'Faltou'}
                    </button>
                  </div>
                ))}
                {chamadaState.Alunos.length === 0 && (
                  <div className="text-slate-500 py-12 text-center italic">Nenhum aluno matriculado nesta turma.</div>
                )}
              </div>

              {chamadaState.Alunos.length > 0 && (
                <div className="mt-8">
                  <button
                    onClick={handleSaveChamada}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all uppercase text-xs tracking-wider"
                  >
                    Salvar Chamada
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: AVALIAÇÃO */}
          {activeTab === 'avaliacao' && (
            <div className="grid grid-cols-1 gap-8">
              <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                  <h3 className="text-xl font-black text-white">Histórico de Avaliações Técnicas</h3>
                  <button onClick={() => { setAvaliacaoForm({ id: null, aluno_id: '', passe: 5, chute: 5, dominio: 5, condicionamento: 5, disciplina: 5, parecer: '', date: new Date().toISOString().split('T')[0] }); setIsModalOpen({ ...isModalOpen, avaliacao: true }); }} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs uppercase">
                    + Nova Avaliação
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Filtrar por Turma</label>
                    <select
                      value={avaliacaoFilterTurma}
                      onChange={(e) => setAvaliacaoFilterTurma(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm"
                    >
                      <option value="">Todas as Turmas</option>
                      {turmas.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Filtrar por Aluno</label>
                    <select
                      value={avaliacaoFilterAluno}
                      onChange={(e) => setAvaliacaoFilterAluno(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm"
                    >
                      <option value="">Todos os Alunos</option>
                      {alunos.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {avaliacoesList.map(av => {
                    const avg = ((av.passe + av.chute + av.dominio + av.condicionamento + av.disciplina) / 5).toFixed(1);
                    return (
                      <div key={av.id} className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-white font-bold">{av.aluno?.name}</div>
                            <div className="text-slate-500 text-xs">Data: {new Date(av.date).toLocaleDateString('pt-BR')} | Prof: {av.professor?.name}</div>
                          </div>
                          <div className="flex gap-2">
                            <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2 py-1 rounded text-xs border border-emerald-500/25">Média: {avg}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
                          {[
                            { k: 'Passe', v: av.passe },
                            { k: 'Chute', v: av.chute },
                            { k: 'Domínio', v: av.dominio },
                            { k: 'Físico', v: av.condicionamento },
                            { k: 'Disciplina', v: av.disciplina },
                          ].map(item => (
                            <div key={item.k} className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-center">
                              <div className="text-[10px] text-slate-500 font-bold uppercase">{item.k}</div>
                              <div className="text-sm font-black text-white">{item.v}/10</div>
                            </div>
                          ))}
                        </div>

                        {av.parecer && (
                          <div className="text-slate-400 text-sm mt-2 p-3 bg-slate-900 rounded-xl border border-slate-800">
                            "{av.parecer}"
                          </div>
                        )}

                        <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-slate-850">
                          <button
                            onClick={() => { setAvaliacaoForm(av); setIsModalOpen({ ...isModalOpen, avaliacao: true }); }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1.5 px-3 rounded-lg text-xs"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteAvaliacao(av.id)}
                            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 font-bold py-1.5 px-3 rounded-lg text-xs"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {avaliacoesList.length === 0 && (
                    <div className="text-slate-500 py-12 text-center italic">Nenhuma avaliação encontrada.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: GERENCIAR ALUNOS */}
          {activeTab === 'alunos' && isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* List */}
              <div className="col-span-1 lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-white">Lista de Alunos</h3>
                  <button onClick={() => { setAlunoForm({ id: null, name: '', responsavel_id: '', birth_date: '', status: 'active', medical_notes: '', photo: '', turma_ids: [], mensalidade_valor: 120, dia_vencimento: 10 }); setIsModalOpen({ ...isModalOpen, aluno: true }); }} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs uppercase">
                    + Adicionar
                  </button>
                </div>
                <div className="space-y-3">
                  {alunos.map(a => (
                    <div key={a.id} className="flex flex-col sm:flex-row justify-between bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60 items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={a.photo_path || 'https://picsum.photos/seed/default/200/200'}
                          alt={a.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <div className="text-white font-bold">{a.name}</div>
                          <div className="text-slate-500 text-xs mt-0.5">Responsável: {a.responsavel?.name}</div>
                          <div className="text-slate-600 text-[10px] mt-0.5">Turmas: {a.turmas.map(t => t.name).join(', ') || 'Nenhuma'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => { handleEditAluno(a); setIsModalOpen({ ...isModalOpen, aluno: true }); }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1.5 px-3 rounded-lg text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteAluno(a.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 font-bold py-1.5 px-3 rounded-lg text-xs"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: PAIS / RESPONSÁVEIS */}
          {activeTab === 'responsaveis' && isAdmin && (
            <div className="grid grid-cols-1 gap-8">
              {/* List */}
              <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-white">Responsáveis</h3>
                  <button onClick={() => { setResponsavelForm({ id: null, name: '', email: '', password: '', phone: '', cpf: '' }); setIsModalOpen({ ...isModalOpen, responsavel: true }); }} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs uppercase">
                    + Adicionar
                  </button>
                </div>
                <div className="space-y-3">
                  {responsaveis.map(r => (
                    <div key={r.id} className="flex justify-between bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60 items-center gap-4">
                      <div>
                        <div className="text-white font-bold">{r.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5">E-mail: {r.email} | Telefone: {r.phone}</div>
                        <div className="text-slate-600 text-[10px] mt-0.5">CPF: {r.cpf}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { handleEditResponsavel(r); setIsModalOpen({ ...isModalOpen, responsavel: true }); }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1.5 px-3 rounded-lg text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteResponsavel(r.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 font-bold py-1.5 px-3 rounded-lg text-xs"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: TURMAS */}
          {activeTab === 'turmas' && isAdmin && (
            <div className="grid grid-cols-1 gap-8">
              
              {/* List */}
              <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-white">Turmas</h3>
                  <button onClick={() => { setTurmaForm({ id: null, name: '', schedule: '', professor_id: '' }); setIsModalOpen({ ...isModalOpen, turma: true }); }} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs uppercase">
                    + Adicionar
                  </button>
                </div>
                <div className="space-y-3">
                  {turmas.map(t => (
                    <div key={t.id} className="flex justify-between bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60 items-center gap-4">
                      <div>
                        <div className="text-white font-bold">{t.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5">Professor: {t.professor?.name} | Horário: {t.schedule}</div>
                        <div className="text-slate-600 text-[10px] mt-0.5">Alunos Matriculados: {t.alunos?.length || 0}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { handleEditTurma(t); setIsModalOpen({ ...isModalOpen, turma: true }); }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1.5 px-3 rounded-lg text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteTurma(t.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 font-bold py-1.5 px-3 rounded-lg text-xs"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROFESSORES */}
          {activeTab === 'professores' && isAdmin && (
            <div className="grid grid-cols-1 gap-8">
              
              {/* List */}
              <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-white">Professores</h3>
                  <button onClick={() => { setProfessorForm({ id: null, name: '', email: '', password: '' }); setIsModalOpen({ ...isModalOpen, professor: true }); }} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs uppercase">
                    + Adicionar
                  </button>
                </div>
                <div className="space-y-3">
                  {professores.map(p => (
                    <div key={p.id} className="flex justify-between bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60 items-center gap-4">
                      <div>
                        <div className="text-white font-bold">{p.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5">E-mail: {p.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { handleEditProfessor(p); setIsModalOpen({ ...isModalOpen, professor: true }); }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1.5 px-3 rounded-lg text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProfessor(p.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 font-bold py-1.5 px-3 rounded-lg text-xs"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: MENSALIDADES */}
          {activeTab === 'financeiro' && isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* List */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                  <h3 className="text-lg font-black text-white">Mensalidades</h3>
                  <div className="flex gap-2">
                    <select
                      value={mensalidadeFilter}
                      onChange={(e) => setMensalidadeFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-850 text-white text-xs rounded-lg px-2.5 py-1.5"
                    >
                      <option value="">Todos Status</option>
                      <option value="paid">Paga</option>
                      <option value="pending">Pendente</option>
                      <option value="overdue">Vencida</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {mensalidadesList.filter(m => !mensalidadeFilter || m.status === mensalidadeFilter).map(m => (
                    <div key={m.id} className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60 flex flex-col gap-4">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <div className="text-white font-bold">{m.aluno?.name}</div>
                          <div className="text-slate-500 text-xs">Vence: {new Date(m.due_date).toLocaleDateString('pt-BR')} | R$ {parseFloat(m.amount).toFixed(2)}</div>
                          {m.status === 'paid' && m.paid_at && (
                            <div className="text-[10px] text-emerald-500 font-semibold mt-1">
                              Pago em: {new Date(m.paid_at).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                          m.status === 'overdue' ? 'bg-red-500/10 text-red-400 border border-red-500/25' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                        }`}>
                          {m.status === 'paid' ? 'Pago' : m.status === 'overdue' ? 'Vencida' : 'Pendente'}
                        </span>
                      </div>

                      {/* Action buttons */}
                      {m.status !== 'paid' && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-850/80 items-stretch sm:items-center justify-end">
                          <button
                            onClick={() => handleBaixaManual(m.id)}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs"
                          >
                            Baixa Manual
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings / Fees Generator */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit">
                <h3 className="text-lg font-black text-white mb-6">Configurações de Taxas</h3>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Juros Mensal (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settingsForm.juros_mensal}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, juros_mensal: e.target.value }))}
                      required
                      placeholder="1.00"
                      className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Multa por Atraso (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settingsForm.multa_atraso}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, multa_atraso: e.target.value }))}
                      required
                      placeholder="2.00"
                      className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase"
                  >
                    Salvar Configurações
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB: LOJA / PDV */}
          {activeTab === 'loja' && isAdmin && (
            <div className="grid grid-cols-1 gap-8">
              
              {/* Product Store */}
              <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-white">PDV - Venda de Uniformes / Acessórios</h3>
                  <button onClick={() => { setProdutoForm({ id: null, name: '', price: '', stock_quantity: '' }); setIsModalOpen({ ...isModalOpen, produto: true }); }} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs uppercase">
                    + Adicionar Produto
                  </button>
                </div>
                
                <form onSubmit={handleVendaProduto} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60 items-end">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Selecione o Produto</label>
                    <select
                      value={vendaForm.produto_id}
                      onChange={(e) => setVendaForm(prev => ({ ...prev, produto_id: e.target.value }))}
                      required
                      className="w-full bg-slate-950 border border-slate-850 text-white rounded-lg px-3 py-2 text-xs"
                    >
                      <option value="">Selecione...</option>
                      {produtos.map(p => (
                        <option key={p.id} value={p.id} disabled={p.stock_quantity <= 0}>
                          {p.name} - R$ {parseFloat(p.price).toFixed(2)} ({p.stock_quantity} no estoque)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Quantidade</label>
                    <input
                      type="number"
                      min="1"
                      value={vendaForm.quantity}
                      onChange={(e) => setVendaForm(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                      required
                      className="w-full bg-slate-950 border border-slate-850 text-white rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 rounded-lg text-xs uppercase"
                  >
                    Registrar Venda
                  </button>
                </form>

                <h3 className="text-md font-bold text-slate-400 mb-4">Catálogo de Produtos</h3>
                <div className="space-y-3">
                  {produtos.map(p => (
                    <div key={p.id} className="flex justify-between bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60 items-center">
                      <div>
                        <div className="text-white font-bold">{p.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5">Preço: R$ {parseFloat(p.price).toFixed(2)} | Estoque: {p.stock_quantity} unidades</div>
                      </div>
                      <button
                        onClick={() => { setProdutoForm({ id: p.id, name: p.name, price: p.price, stock_quantity: p.stock_quantity }); setIsModalOpen({ ...isModalOpen, produto: true }); }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1.5 px-3 rounded-lg text-xs"
                      >
                        Editar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form moved to Modal */}

            </div>
          )}

          {/* TAB: FLUXO DE CAIXA */}
          {activeTab === 'fluxo' && isAdmin && (
            <div className="grid grid-cols-1 gap-8">
              
              {/* Ledger */}
              <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-white">Livro de Fluxo de Caixa</h3>
                  <button onClick={() => { setFluxoForm({ type: 'expense', description: '', amount: '', date: new Date().toISOString().split('T')[0] }); setIsModalOpen({ ...isModalOpen, fluxo: true }); }} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs uppercase">
                    + Lançar Caixa
                  </button>
                </div>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {fluxoCaixa.map(f => (
                    <div key={f.id} className="flex justify-between bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60 items-center gap-4">
                      <div>
                        <div className="text-white font-bold text-sm">{f.description}</div>
                        <div className="text-slate-500 text-xs mt-0.5">Origem: {f.origin_type} | Data: {new Date(f.date).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <span className={`font-black text-sm ${
                        f.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {f.type === 'income' ? '+' : '-'} R$ {parseFloat(f.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {fluxoCaixa.length === 0 && (
                    <div className="text-slate-500 py-12 text-center italic">Nenhum lançamento no fluxo de caixa.</div>
                  )}
                </div>
              </div>

              {/* Form moved to Modal */}

            </div>
          )}

        </main>
      </div>

    </div>
  );
}

export default AdminDashboard;
