import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { QRCodeSVG } from 'qrcode.react';
import { generatePixPayload } from '../utils/pixPayload';

function ParentPortal({ logout }) {
  const [filhos, setFilhos] = useState([]);
  const [selectedFilhoId, setSelectedFilhoId] = useState(null);
  const [detalhes, setDetalhes] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  const [pixModal, setPixModal] = useState(null); // stores { type, key, amount, ... }

  // Overdue blocking modal states
  const [selectedOverdueId, setSelectedOverdueId] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(''); // 'key' | 'code' | 'modal_key' | 'modal_code'
  const [statusMessage, setStatusMessage] = useState(null);
  const navigate = useNavigate();
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchFilhos();
  }, []);

  const fetchFilhos = async (keepCurrentSelection = false) => {
    try {
      const res = await api.get('/portal/filhos');
      const filhosList = Array.isArray(res.data) ? res.data : (res.data.filhos || []);
      const globalSettings = res.data.settings || null;
      if (globalSettings) setSettings(globalSettings);

      setFilhos(filhosList);

      if (filhosList.length > 0) {
        const targetId = (keepCurrentSelection && selectedFilhoId) ? selectedFilhoId : filhosList[0].id;
        setSelectedFilhoId(targetId);
        fetchFilhoDetalhes(targetId);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchFilhoDetalhes = async (id, silent = false) => {
    if (!silent) setLoadingDetalhes(true);
    try {
      const res = await api.get(`/portal/filhos/${id}`);
      setDetalhes(res.data);
      if (res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) {
        setLoadingDetalhes(false);
        setLoading(false);
      }
    }
  };

  const handleFilhoChange = (id) => {
    setSelectedFilhoId(id);
    fetchFilhoDetalhes(id);
  };

  const handleLogout = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    localStorage.removeItem('token');
    logout();
    navigate('/login');
  };

  // Compute all overdue monthly fees across all children
  const overdueMensalidades = useMemo(() => {
    const list = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. From all filhos in memory
    filhos.forEach(f => {
      (f.mensalidades || []).forEach(m => {
        const dueDate = new Date(m.due_date + 'T23:59:59');
        const isOverdue = parseFloat(m.amount) > 0 && (m.status === 'overdue' || (m.status === 'pending' && dueDate < today));
        if (isOverdue && !list.some(item => item.id === m.id)) {
          list.push({ ...m, alunoNome: f.name, alunoId: f.id });
        }
      });
    });

    // 2. From detalhes if loaded
    if (detalhes?.mensalidades && detalhes?.aluno) {
      detalhes.mensalidades.forEach(m => {
        const dueDate = new Date(m.due_date + 'T23:59:59');
        const isOverdue = parseFloat(m.amount) > 0 && (m.status === 'overdue' || (m.status === 'pending' && dueDate < today));
        if (isOverdue && !list.some(item => item.id === m.id)) {
          list.push({ ...m, alunoNome: detalhes.aluno.name, alunoId: detalhes.aluno.id });
        }
      });
    }

    return list;
  }, [filhos, detalhes]);

  const hasOverdue = overdueMensalidades.length > 0;
  const activeSettings = detalhes?.settings || settings;

  // Selected overdue fee for payment view
  const activeOverdue = useMemo(() => {
    if (!hasOverdue) return null;
    if (selectedOverdueId) {
      const found = overdueMensalidades.find(m => m.id === selectedOverdueId);
      if (found) return found;
    }
    return overdueMensalidades[0];
  }, [hasOverdue, selectedOverdueId, overdueMensalidades]);

  // Real-time polling for automatic payment (Asaas)
  useEffect(() => {
    if (hasOverdue && activeSettings?.payment_method !== 'manual' && selectedFilhoId) {
      pollingRef.current = setInterval(() => {
        fetchFilhos(true);
      }, 6000);
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [hasOverdue, activeSettings?.payment_method, selectedFilhoId]);

  const handleManualCheckPayment = async () => {
    setCheckingPayment(true);
    setStatusMessage(null);
    try {
      await fetchFilhos(true);
      if (selectedFilhoId) {
        await fetchFilhoDetalhes(selectedFilhoId, true);
      }
      setTimeout(() => {
        setCheckingPayment(false);
        setStatusMessage('Status atualizado. Se o pagamento foi efetuado, aguarde a confirmação da administração.');
      }, 800);
    } catch (e) {
      setCheckingPayment(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(type);
    setTimeout(() => setCopyFeedback(''), 2500);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white font-bold animate-pulse text-lg">
        Carregando informações dos alunos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-12 relative">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/logo_sistema.jpg" alt="Logo" className="w-10 h-10 object-contain hidden sm:inline-block rounded-xl border border-slate-700 shadow-sm" />
          <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Portal dos Pais</h1>
        </div>
        <div className="flex items-center space-x-4">
          {filhos.length > 1 && (
            <select
              value={selectedFilhoId || ''}
              onChange={(e) => handleFilhoChange(e.target.value)}
              disabled={hasOverdue}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-1.5 focus:outline-none disabled:opacity-50"
            >
              {filhos.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={handleLogout}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 transition-all"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Portal Body (Blurred & Disabled when there is an overdue bill) */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${hasOverdue ? 'filter blur-md pointer-events-none select-none opacity-40' : ''}`}>
        {filhos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <span className="text-5xl mb-4">📭</span>
            <h2 className="text-xl font-semibold text-slate-300">Nenhum aluno cadastrado</h2>
            <p className="text-slate-500 mt-2 max-w-md">Não encontramos nenhum aluno vinculado ao seu CPF no sistema. Entre em contato com a administração da escolinha.</p>
          </div>
        ) : (
          <div className="flex-1 max-w-6xl w-full mx-auto px-4 mt-8 flex flex-col gap-6">
            {/* Student Quick Card */}
            {detalhes && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                <img
                  src={detalhes.aluno.photo_path || 'https://picsum.photos/seed/default/200/200'}
                  alt={detalhes.aluno.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/30"
                />
                <div className="text-center md:text-left flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                    <h2 className="text-2xl font-black text-white">{detalhes.aluno.name}</h2>
                    <span className={`inline-block self-center px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      detalhes.aluno.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                      detalhes.aluno.status === 'inactive' ? 'bg-slate-500/15 text-slate-400 border border-slate-500/30' :
                      'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {detalhes.aluno.status === 'active' ? 'Matrícula Ativa' :
                       detalhes.aluno.status === 'inactive' ? 'Inativo' : 'Suspenso'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">Nascimento: {new Date(detalhes.aluno.birth_date).toLocaleDateString('pt-BR')}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {detalhes.aluno.turmas.map(t => (
                      <span key={t.id} className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-lg border border-slate-700 font-medium">
                        Turma: {t.name} ({t.schedule})
                      </span>
                    ))}
                    {detalhes.aluno.turmas.length === 0 && (
                      <span className="text-slate-500 text-xs italic">Nenhuma turma vinculada</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-center min-w-[140px]">
                  <div className="text-emerald-400 text-3xl font-black">{detalhes.frequencia_porcentagem}%</div>
                  <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-1">Presença Geral</div>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto w-full sm:w-auto border-b border-slate-800 gap-1 bg-slate-900/40 p-1.5 rounded-2xl self-start border">
              <button
                onClick={() => setActiveTab('geral')}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'geral' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Geral
              </button>
              <button
                onClick={() => setActiveTab('desempenho')}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'desempenho' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Desempenho
              </button>
              <button
                onClick={() => setActiveTab('financeiro')}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'financeiro' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Financeiro
              </button>
            </div>

            {/* Tab Contents */}
            {loadingDetalhes ? (
              <div className="py-12 text-center text-slate-500 animate-pulse">Carregando detalhes do aluno...</div>
            ) : (
              detalhes && (
                <div className="space-y-6">
                  
                  {/* TAB: GERAL */}
                  {activeTab === 'geral' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <span>🩺</span> Ficha Médica & Cuidados
                        </h3>
                        <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 min-h-[120px]">
                          <p className="text-slate-300 text-sm whitespace-pre-wrap">
                            {detalhes.aluno.medical_notes || 'Nenhuma observação ou restrição médica cadastrada para este aluno.'}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <span>📅</span> Aulas Recentes (Frequência)
                        </h3>
                        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2">
                          {detalhes.frequencias.map(f => (
                            <div key={f.id} className="flex justify-between items-center bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/50">
                              <div>
                                <div className="text-sm font-bold text-white">{f.turma.name}</div>
                                <div className="text-slate-500 text-xs">{new Date(f.date).toLocaleDateString('pt-BR')}</div>
                              </div>
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                f.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {f.status === 'present' ? 'Presente' : 'Falta'}
                              </span>
                            </div>
                          ))}
                          {detalhes.frequencias.length === 0 && (
                            <div className="text-slate-500 text-sm py-8 text-center italic">Nenhum registro de chamada encontrado.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: DESEMPENHO */}
                  {activeTab === 'desempenho' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span>📊</span> Avaliação Física & Técnica
                      </h3>

                      {detalhes.avaliacoes && detalhes.avaliacoes.length > 0 ? (
                        <div className="space-y-8">
                          {detalhes.avaliacoes.map((av) => (
                            <div key={av.id} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-950/20 p-6 rounded-3xl border border-slate-800/40">
                              <div>
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-white font-bold">Avaliação {new Date(av.date).toLocaleDateString('pt-BR')}</h4>
                                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full text-xs border border-emerald-500/20">
                                    Média: {((av.passe + av.chute + av.dominio + av.condicionamento + av.disciplina) / 5).toFixed(1)}
                                  </span>
                                </div>
                                <div className="space-y-4">
                                  {[
                                    { label: 'Passe', val: av.passe },
                                    { label: 'Chute', val: av.chute },
                                    { label: 'Domínio de Bola', val: av.dominio },
                                    { label: 'Condicionamento Físico', val: av.condicionamento },
                                    { label: 'Disciplina / Postura', val: av.disciplina },
                                  ].map((item, idx) => (
                                    <div key={idx}>
                                      <div className="flex justify-between text-sm mb-1.5">
                                        <span className="font-semibold text-slate-300">{item.label}</span>
                                        <span className="font-bold text-emerald-400">{item.val}/10</span>
                                      </div>
                                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                                        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: `${item.val * 10}%` }} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                                <div>
                                  <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Parecer do Professor</span>
                                  <p className="text-slate-300 text-sm italic mt-3 whitespace-pre-wrap">
                                    "{av.parecer || 'Sem parecer descritivo.'}"
                                  </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-500">
                                  <div>Avaliado por: <strong className="text-slate-300">{av.professor?.name}</strong></div>
                                  <div>Data: {new Date(av.date).toLocaleDateString('pt-BR')}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-500 italic">Nenhuma avaliação técnica feita ainda para este aluno.</div>
                      )}
                    </div>
                  )}

                  {/* TAB: FINANCEIRO */}
                  {activeTab === 'financeiro' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span>💳</span> Histórico de Mensalidades
                      </h3>

                      <div className="space-y-3">
                        {detalhes.mensalidades.map(m => (
                          <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 gap-4">
                            <div>
                              <div className="text-white font-bold">Vencimento: {new Date(m.due_date).toLocaleDateString('pt-BR')}</div>
                              <div className="text-slate-400 text-sm font-semibold mt-1">Valor: R$ {parseFloat(m.amount).toFixed(2)}</div>
                              {m.paid_at && (
                                <div className="text-[10px] text-slate-500 mt-1">Pago em: {new Date(m.paid_at).toLocaleString('pt-BR')}</div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                                m.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                m.status === 'overdue' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {m.status === 'paid' ? 'Pago' :
                                 m.status === 'overdue' ? 'Vencida' : 'Pendente'}
                              </span>

                              {m.status !== 'paid' && (
                                <div className="flex gap-2">
                                  {activeSettings?.payment_method === 'manual' && activeSettings?.pix_key && (
                                    <button
                                      onClick={() => setPixModal({ type: 'manual', key: activeSettings.pix_key, amount: m.amount, alunoNome: detalhes.aluno.name })}
                                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                                    >
                                      Pagar via PIX
                                    </button>
                                  )}

                                  {activeSettings?.payment_method !== 'manual' && (
                                    <>
                                      {m.pix_code && (
                                        <button
                                          onClick={() => setPixModal({ type: 'asaas', key: m.pix_code, amount: m.amount, alunoNome: detalhes.aluno.name })}
                                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                                        >
                                          PIX (Copia e Cola)
                                        </button>
                                      )}
                                      {m.payment_url && (
                                        <a
                                          href={m.payment_url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all inline-block"
                                        >
                                          Pagar / Boleto
                                        </a>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {detalhes.mensalidades.length === 0 && (
                          <div className="text-slate-500 text-sm py-12 text-center italic">Nenhuma mensalidade cadastrada.</div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL DE BLOQUEIO POR MENSALIDADE ATRASADA (OBRIGATÓRIO)       */}
      {/* ============================================================== */}
      {hasOverdue && activeOverdue && (() => {
        const isManual = activeSettings?.payment_method === 'manual';
        const manualPayload = isManual && activeSettings?.pix_key
          ? generatePixPayload({
              key: activeSettings.pix_key,
              name: activeSettings.pix_name || 'Escolinha',
              city: activeSettings.pix_city || 'Toledo',
              amount: activeOverdue.amount,
              txid: `MENS${activeOverdue.id}`
            })
          : null;

        const pixCodeToUse = isManual ? manualPayload : (activeOverdue.pix_code || '');

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
            <div className="bg-slate-900 border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative my-8">
              
              {/* Alert Header */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-2xl flex-shrink-0 animate-bounce">
                  ⚠️
                </div>
                <div>
                  <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1">
                    Acesso Restrito
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Pendência Financeira</h2>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Identificamos mensalidade(s) em atraso. De acordo com as normas da escolinha, o acesso ao boletim, faltas e avaliações do aluno é <strong className="text-red-400">liberado imediatamente após a regularização</strong> do pagamento abaixo:
              </p>

              {/* Multiple Overdue Selector (if more than 1) */}
              {overdueMensalidades.length > 1 && (
                <div className="mb-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Mensalidades pendentes ({overdueMensalidades.length}):</span>
                  <div className="flex flex-col gap-2">
                    {overdueMensalidades.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedOverdueId(m.id)}
                        className={`p-2.5 rounded-xl text-left text-xs font-semibold flex justify-between items-center transition-all ${
                          activeOverdue.id === m.id
                            ? 'bg-red-500/20 border border-red-500/50 text-white'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>Aluno: <strong className="text-slate-200">{m.alunoNome}</strong> (Venc: {new Date(m.due_date).toLocaleDateString('pt-BR')})</span>
                        <span className="text-emerald-400 font-bold">R$ {parseFloat(m.amount).toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Overdue Item Summary */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="text-xs text-slate-400">Aluno: <strong className="text-white text-sm">{activeOverdue.alunoNome}</strong></div>
                  <div className="text-xs text-slate-400 mt-1">Vencimento: <strong className="text-red-400">{new Date(activeOverdue.due_date).toLocaleDateString('pt-BR')}</strong></div>
                </div>
                <div className="sm:text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Valor a Regularizar</div>
                  <div className="text-2xl font-black text-emerald-400">R$ {parseFloat(activeOverdue.amount).toFixed(2)}</div>
                </div>
              </div>

              {/* QR Code and PIX details */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-5 mb-5 flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Escaneie o QR Code para pagar</span>
                
                <div className="bg-white p-3 rounded-2xl shadow-xl mb-4">
                  {pixCodeToUse ? (
                    <QRCodeSVG value={pixCodeToUse} size={180} level="M" />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-500 text-center p-2">
                      Código PIX não disponível. Contate a administração.
                    </div>
                  )}
                </div>

                {/* Show Raw PIX Key when manual */}
                {isManual && activeSettings?.pix_key && (
                  <div className="w-full mb-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Chave PIX Oficial:</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Transferência PIX</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 font-mono text-xs text-white bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 select-all truncate">
                        {activeSettings.pix_key}
                      </div>
                      <button
                        onClick={() => copyToClipboard(activeSettings.pix_key, 'key')}
                        className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 flex-shrink-0"
                      >
                        {copyFeedback === 'key' ? '✅ Copiada!' : 'Copiar Chave'}
                      </button>
                    </div>
                    {activeSettings.pix_name && (
                      <div className="text-[10px] text-slate-400 mt-1.5">
                        Beneficiário: <strong className="text-slate-200">{activeSettings.pix_name}</strong> {activeSettings.pix_city ? `• ${activeSettings.pix_city}` : ''}
                      </div>
                    )}
                  </div>
                )}

                {/* Show Pix Copia e Cola */}
                {pixCodeToUse && (
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">PIX Copia e Cola:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 font-mono text-[11px] text-emerald-400 bg-slate-950 px-2.5 py-2 rounded-lg border border-slate-800 select-all truncate">
                        {pixCodeToUse}
                      </div>
                      <button
                        onClick={() => copyToClipboard(pixCodeToUse, 'code')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black px-4 py-2 rounded-lg transition-all flex-shrink-0 shadow-lg shadow-emerald-500/20"
                      >
                        {copyFeedback === 'code' ? '✅ Copiado!' : 'Copiar PIX'}
                      </button>
                    </div>
                  </div>
                )}

                {/* External payment link if available (e.g. Asaas Boleto/Cartão) */}
                {!isManual && activeOverdue.payment_url && (
                  <div className="w-full mt-3">
                    <a
                      href={activeOverdue.payment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center w-full bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold py-2 rounded-xl transition-all"
                    >
                      Pagar com Boleto ou Cartão de Crédito
                    </a>
                  </div>
                )}
              </div>

              {/* Instructions and Actions */}
              {isManual ? (
                <div className="bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs p-3.5 rounded-2xl leading-relaxed mb-4">
                  ⚠️ <strong>Atenção:</strong> Como este pagamento é realizado via chave PIX direta, o acesso ao portal é liberado pela secretaria após o envio do comprovante.
                </div>
              ) : (
                <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-2xl leading-relaxed mb-4 flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <span><strong>Liberação Automática:</strong> O sistema reconhece o pagamento PIX instantaneamente. Assim que você pagar no seu banco, seu acesso será desbloqueado em poucos instantes!</span>
                </div>
              )}

              {statusMessage && (
                <div className="bg-blue-500/15 border border-blue-500/30 text-blue-200 text-xs p-3 rounded-xl mb-4 text-center">
                  {statusMessage}
                </div>
              )}

              {/* Buttons: Check Payment and Send WhatsApp */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleManualCheckPayment}
                  disabled={checkingPayment}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black py-3 rounded-xl transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                >
                  {checkingPayment ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      <span>Já Paguei / Atualizar</span>
                    </>
                  )}
                </button>

                {isManual && (
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Olá! Realizei o pagamento da mensalidade do aluno ${activeOverdue.alunoNome} no valor de R$ ${parseFloat(activeOverdue.amount).toFixed(2)}. Segue o comprovante para liberação do acesso ao portal.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <span>💬</span>
                    <span>Enviar Comprovante</span>
                  </a>
                )}
              </div>

              {/* Logout Option */}
              <div className="mt-5 pt-4 border-t border-slate-800 text-center">
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-slate-200 text-xs font-medium underline transition-all"
                >
                  Sair do Portal / Desconectar
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* REGULAR PIX MODAL (Para pagamentos não vencidos na aba Financeiro) */}
      {/* ============================================================== */}
      {pixModal && (() => {
        const isManual = pixModal.type === 'manual';
        const pixCodeToDisplay = isManual 
          ? generatePixPayload({
              key: pixModal.key,
              name: activeSettings?.pix_name || 'Escolinha',
              city: activeSettings?.pix_city || 'Toledo',
              amount: pixModal.amount,
              txid: `PAGTO`
            })
          : pixModal.key;

        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Pagamento via PIX</h3>
                <button onClick={() => setPixModal(null)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
              </div>

              <p className="text-slate-400 text-sm">Escaneie o QR Code ou copie a linha digitável abaixo para pagar no aplicativo do seu banco:</p>
              
              <div className="flex justify-center my-5 bg-white p-4 rounded-2xl w-fit mx-auto shadow-xl">
                <QRCodeSVG value={pixCodeToDisplay} size={190} level="M" />
              </div>

              {/* Raw Key when manual */}
              {isManual && activeSettings?.pix_key && (
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Chave PIX:</span>
                    <button
                      onClick={() => copyToClipboard(activeSettings.pix_key, 'modal_key')}
                      className="text-emerald-400 hover:text-emerald-300 text-xs font-bold"
                    >
                      {copyFeedback === 'modal_key' ? '✅ Copiada!' : 'Copiar Chave'}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-white truncate select-all">{activeSettings.pix_key}</div>
                  {activeSettings.pix_name && (
                    <div className="text-[10px] text-slate-500 mt-1">Beneficiário: {activeSettings.pix_name}</div>
                  )}
                </div>
              )}

              {/* PIX Copia e Cola */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 my-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Código PIX Copia e Cola:</span>
                  <button
                    onClick={() => copyToClipboard(pixCodeToDisplay, 'modal_code')}
                    className="text-emerald-400 hover:text-emerald-300 text-xs font-bold"
                  >
                    {copyFeedback === 'modal_code' ? '✅ Copiado!' : 'Copiar Código'}
                  </button>
                </div>
                <div className="select-all break-all text-[11px] font-mono text-emerald-400 line-clamp-2">
                  {pixCodeToDisplay}
                </div>
              </div>

              {isManual ? (
                <div className="bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs p-3.5 rounded-2xl leading-relaxed mb-6">
                  ⚠️ <strong>Importante:</strong> Após realizar o pagamento, envie o comprovante para a coordenação para a baixa no sistema.
                </div>
              ) : (
                <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-2xl leading-relaxed mb-6">
                  ✅ O pagamento será reconhecido automaticamente em alguns instantes.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(pixCodeToDisplay, 'modal_code')}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-sm"
                >
                  {copyFeedback === 'modal_code' ? '✅ PIX Copiado!' : 'Copiar PIX'}
                </button>
                <button
                  onClick={() => setPixModal(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default ParentPortal;
