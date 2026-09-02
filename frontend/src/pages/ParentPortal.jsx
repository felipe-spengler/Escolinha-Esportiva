import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function ParentPortal({ logout }) {
  const [filhos, setFilhos] = useState([]);
  const [selectedFilhoId, setSelectedFilhoId] = useState(null);
  const [detalhes, setDetalhes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  const [pixModal, setPixModal] = useState(null); // stores mensalidade with pix_code
  const navigate = useNavigate();

  useEffect(() => {
    fetchFilhos();
  }, []);

  const fetchFilhos = async () => {
    try {
      const res = await api.get('/portal/filhos');
      setFilhos(res.data);
      if (res.data.length > 0) {
        setSelectedFilhoId(res.data[0].id);
        fetchFilhoDetalhes(res.data[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchFilhoDetalhes = async (id) => {
    setLoadingDetalhes(true);
    try {
      const res = await api.get(`/portal/filhos/${id}`);
      setDetalhes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetalhes(false);
      setLoading(false);
    }
  };

  const handleFilhoChange = (id) => {
    setSelectedFilhoId(id);
    fetchFilhoDetalhes(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white font-bold animate-pulse text-lg">
        Carregando informações dos alunos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-12">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl hidden sm:inline-block">⚽</span>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Portal dos Pais</h1>
        </div>
        <div className="flex items-center space-x-4">
          {filhos.length > 1 && (
            <select
              value={selectedFilhoId || ''}
              onChange={(e) => handleFilhoChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-1.5 focus:outline-none"
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

                    {detalhes.ultima_avaliacao ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <div className="space-y-4">
                            {[
                              { label: 'Passe', val: detalhes.ultima_avaliacao.passe },
                              { label: 'Chute', val: detalhes.ultima_avaliacao.chute },
                              { label: 'Domínio de Bola', val: detalhes.ultima_avaliacao.dominio },
                              { label: 'Condicionamento Físico', val: detalhes.ultima_avaliacao.condicionamento },
                              { label: 'Disciplina / Postura', val: detalhes.ultima_avaliacao.disciplina },
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
                              "{detalhes.ultima_avaliacao.parecer || 'Sem parecer descritivo.'}"
                            </p>
                          </div>
                          <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-500">
                            <div>Avaliado por: <strong className="text-slate-300">{detalhes.ultima_avaliacao.professor.name}</strong></div>
                            <div>Data: {new Date(detalhes.ultima_avaliacao.date).toLocaleDateString('pt-BR')}</div>
                          </div>
                        </div>
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

                            {m.status !== 'paid' && m.pix_code && (
                              <button
                                onClick={() => setPixModal(m)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                              >
                                Pagar via PIX
                              </button>
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

      {/* PIX MODAL */}
      {pixModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Pagamento via PIX</h3>
            <p className="text-slate-400 text-sm">Copie a linha digitável do PIX abaixo para pagar no aplicativo do seu banco:</p>
            
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 my-4 select-all break-all text-xs font-mono text-emerald-400">
              {pixModal.pix_code}
            </div>

            <div className="bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs p-4 rounded-2xl leading-relaxed mb-6">
              ⚠️ <strong>Importante:</strong> Após realizar o pagamento, a baixa é manual. Envie o comprovante para o administrador da escolinha para validar o pagamento.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pixModal.pix_code);
                  alert('Código PIX copiado com sucesso!');
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-sm"
              >
                Copiar Código PIX
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
      )}
    </div>
  );
}

export default ParentPortal;
