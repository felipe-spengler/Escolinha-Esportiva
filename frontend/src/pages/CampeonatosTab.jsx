import React, { useState, useEffect } from 'react';
import api from '../api';

function CampeonatosTab({ alunos, isAdmin }) {
  const [campeonatos, setCampeonatos] = useState([]);
  const [selectedCampeonato, setSelectedCampeonato] = useState(null);
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [campeonatoForm, setCampeonatoForm] = useState({ id: null, name: '', start_date: '', end_date: '', status: 'active' });
  const [equipeForm, setEquipeForm] = useState({ name: '', coach_name: '' });
  const [jogadorForm, setJogadorForm] = useState({ is_aluno: true, aluno_id: '', name: '', number: '' });
  const [jogoForm, setJogoForm] = useState({ equipe_casa_id: '', equipe_visitante_id: '', date: '', time: '' });
  const [eventoForm, setEventoForm] = useState({ jogador_id: '', minute: '', type: 'goal', description: '' });

  // Modals
  const [isModalOpen, setIsModalOpen] = useState({ campeonato: false, equipe: false, jogador: false, jogo: false, sumula: false });
  const [currentEquipeId, setCurrentEquipeId] = useState(null);
  const [currentJogo, setCurrentJogo] = useState(null);
  const [eventosJogo, setEventosJogo] = useState([]);

  useEffect(() => {
    fetchCampeonatos();
  }, []);

  const fetchCampeonatos = async () => {
    try {
      const res = await api.get('/campeonatos');
      setCampeonatos(res.data);
      if (selectedCampeonato) {
        const updated = res.data.find(c => c.id === selectedCampeonato.id);
        setSelectedCampeonato(updated || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipes = async (campId) => {
    try {
      const res = await api.get(`/campeonatos/${campId}/equipes`);
      setEquipes(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const selectCampeonato = (camp) => {
    setSelectedCampeonato(camp);
    fetchEquipes(camp.id);
  };

  // --- CRUD CAMPEONATO ---
  const saveCampeonato = async (e) => {
    e.preventDefault();
    try {
      if (campeonatoForm.id) {
        await api.put(`/campeonatos/${campeonatoForm.id}`, campeonatoForm);
      } else {
        await api.post('/campeonatos', campeonatoForm);
      }
      setIsModalOpen(prev => ({ ...prev, campeonato: false }));
      fetchCampeonatos();
    } catch (e) {
      alert('Erro ao salvar campeonato');
    }
  };

  // --- CRUD EQUIPE ---
  const saveEquipe = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/campeonatos/${selectedCampeonato.id}/equipes`, equipeForm);
      setEquipeForm({ name: '', coach_name: '' });
      setIsModalOpen(prev => ({ ...prev, equipe: false }));
      fetchEquipes(selectedCampeonato.id);
      fetchCampeonatos(); // to update team count
    } catch (e) {
      alert('Erro ao salvar equipe');
    }
  };

  // --- CRUD JOGADORES ---
  const saveJogador = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/equipes/${currentEquipeId}/jogadores`, jogadorForm);
      setJogadorForm({ is_aluno: true, aluno_id: '', name: '', number: '' });
      setIsModalOpen(prev => ({ ...prev, jogador: false }));
      fetchEquipes(selectedCampeonato.id);
    } catch (e) {
      alert('Erro ao salvar jogador');
    }
  };

  const deleteJogador = async (id) => {
    if(!confirm('Deseja remover este jogador?')) return;
    try {
      await api.delete(`/jogadores/${id}`);
      fetchEquipes(selectedCampeonato.id);
    } catch (e) {
      alert('Erro');
    }
  };

  // --- CRUD JOGOS ---
  const saveJogo = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/campeonatos/${selectedCampeonato.id}/jogos`, jogoForm);
      setIsModalOpen(prev => ({ ...prev, jogo: false }));
      fetchCampeonatos();
    } catch (e) {
      alert('Erro ao agendar jogo');
    }
  };

  const finalizarJogo = async (jogoId) => {
    if(!confirm('Deseja encerrar a partida? O placar não será mais alterado pela súmula automaticamente.')) return;
    try {
      await api.put(`/jogos/${jogoId}/finalizar`);
      fetchCampeonatos();
    } catch (e) {
      alert('Erro ao finalizar jogo');
    }
  };

  // --- SÚMULA ---
  const openSumula = async (jogo) => {
    setCurrentJogo(jogo);
    setIsModalOpen(prev => ({ ...prev, sumula: true }));
    try {
      const res = await api.get(`/jogos/${jogo.id}/eventos`);
      setEventosJogo(res.data);
    } catch (e) {}
  };

  const saveEvento = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/jogos/${currentJogo.id}/eventos`, eventoForm);
      setEventoForm({ jogador_id: '', minute: '', type: 'goal', description: '' });
      const res = await api.get(`/jogos/${currentJogo.id}/eventos`);
      setEventosJogo(res.data);
      fetchCampeonatos(); // update placar
    } catch (e) {
      alert('Erro ao registrar evento na súmula');
    }
  };

  const deleteEvento = async (id) => {
    if(!confirm('Deseja excluir este evento?')) return;
    try {
      await api.delete(`/eventos/${id}`);
      const res = await api.get(`/jogos/${currentJogo.id}/eventos`);
      setEventosJogo(res.data);
      fetchCampeonatos();
    } catch (e) {
      alert('Erro');
    }
  };

  if (loading) return <div className="text-white p-6">Carregando campeonatos...</div>;

  return (
    <div className="space-y-6">
      
      {/* CAMPEONATO MODAL */}
      {isModalOpen.campeonato && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(prev => ({ ...prev, campeonato: false }))} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-black text-white mb-6">Cadastrar Campeonato</h3>
            <form onSubmit={saveCampeonato} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nome do Torneio</label>
                <input type="text" required value={campeonatoForm.name} onChange={e => setCampeonatoForm(p => ({...p, name: e.target.value}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Data Início</label>
                  <input type="date" required value={campeonatoForm.start_date} onChange={e => setCampeonatoForm(p => ({...p, start_date: e.target.value}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Data Fim</label>
                  <input type="date" required value={campeonatoForm.end_date} onChange={e => setCampeonatoForm(p => ({...p, end_date: e.target.value}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase mt-2">Salvar</button>
            </form>
          </div>
        </div>
      )}

      {/* SUMULA MODAL */}
      {isModalOpen.sumula && currentJogo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(prev => ({ ...prev, sumula: false }))} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <button onClick={() => setIsModalOpen(prev => ({ ...prev, sumula: false }))} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 rounded-full w-8 h-8">✕</button>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-white">Súmula da Partida</h3>
              <div className="text-slate-400 text-sm mt-1">{currentJogo.equipeCasa?.name} {currentJogo.gols_casa} x {currentJogo.gols_visitante} {currentJogo.equipeVisitante?.name}</div>
              <div className="text-xs font-bold uppercase mt-2 px-3 py-1 bg-slate-800 inline-block rounded text-slate-300">
                {currentJogo.status === 'finished' ? 'PARTIDA ENCERRADA' : 'EM ANDAMENTO'}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
              {/* Lado esquerdo: Formulário (só se não finalizado) */}
              {currentJogo.status !== 'finished' && isAdmin && (
                <div className="w-full md:w-1/3 border-r border-slate-800 pr-0 md:pr-6 overflow-y-auto">
                  <h4 className="text-sm font-bold text-white mb-4">Adicionar Evento</h4>
                  <form onSubmit={saveEvento} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Minuto</label>
                      <input type="number" min="0" max="150" required value={eventoForm.minute} onChange={e => setEventoForm(p => ({...p, minute: e.target.value}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Tipo</label>
                      <select required value={eventoForm.type} onChange={e => setEventoForm(p => ({...p, type: e.target.value}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm">
                        <option value="goal">Gol</option>
                        <option value="yellow_card">Cartão Amarelo</option>
                        <option value="red_card">Cartão Vermelho</option>
                        <option value="sub_in">Substituição (Entra)</option>
                        <option value="sub_out">Substituição (Sai)</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Jogador (Opcional)</label>
                      <select value={eventoForm.jogador_id} onChange={e => setEventoForm(p => ({...p, jogador_id: e.target.value}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm">
                        <option value="">Nenhum/Desconhecido</option>
                        <optgroup label={currentJogo.equipeCasa?.name}>
                          {equipes.find(eq => eq.id === currentJogo.equipeCasa?.id)?.jogadores.map(j => (
                            <option key={j.id} value={j.id}>[{j.number}] {j.is_aluno ? j.aluno?.name : j.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label={currentJogo.equipeVisitante?.name}>
                          {equipes.find(eq => eq.id === currentJogo.equipeVisitante?.id)?.jogadores.map(j => (
                            <option key={j.id} value={j.id}>[{j.number}] {j.is_aluno ? j.aluno?.name : j.name}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Descrição Curta</label>
                      <input type="text" value={eventoForm.description} onChange={e => setEventoForm(p => ({...p, description: e.target.value}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" placeholder="Ex: De falta" />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl text-xs uppercase">Registrar</button>
                  </form>
                </div>
              )}

              {/* Lado direito: Lista de Eventos (Timeline) */}
              <div className="w-full md:flex-1 overflow-y-auto pr-2">
                <h4 className="text-sm font-bold text-white mb-4">Linha do Tempo</h4>
                <div className="space-y-3">
                  {eventosJogo.sort((a,b) => a.minute - b.minute).map(ev => {
                    const jogadorNome = ev.jogador ? (ev.jogador.is_aluno ? ev.jogador.aluno?.name : ev.jogador.name) : 'Desconhecido';
                    const icon = ev.type === 'goal' ? '⚽ Gol' : ev.type === 'yellow_card' ? '🟨 Amarelo' : ev.type === 'red_card' ? '🟥 Vermelho' : ev.type === 'sub_in' ? '🔼 Entrou' : ev.type === 'sub_out' ? '🔽 Saiu' : '📌';
                    return (
                      <div key={ev.id} className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-lg text-emerald-400 w-8">{ev.minute}'</span>
                          <div>
                            <div className="text-white font-bold text-sm">{icon} - {jogadorNome}</div>
                            {ev.description && <div className="text-xs text-slate-400">{ev.description}</div>}
                          </div>
                        </div>
                        {currentJogo.status !== 'finished' && isAdmin && (
                          <button onClick={() => deleteEvento(ev.id)} className="text-red-500 hover:text-red-400 text-xs font-bold">X</button>
                        )}
                      </div>
                    );
                  })}
                  {eventosJogo.length === 0 && <div className="text-slate-500 italic text-sm">Nenhum evento registrado ainda.</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EQUIPE E JOGADOR MODALS */}
      {isModalOpen.equipe && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(prev => ({ ...prev, equipe: false }))} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-black text-white mb-6">Nova Equipe em {selectedCampeonato?.name}</h3>
            <form onSubmit={saveEquipe} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nome do Time</label>
                <input type="text" required value={equipeForm.name} onChange={e => setEquipeForm(p => ({...p, name: e.target.value}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nome do Técnico</label>
                <input type="text" value={equipeForm.coach_name} onChange={e => setEquipeForm(p => ({...p, coach_name: e.target.value}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase mt-2">Salvar Equipe</button>
            </form>
          </div>
        </div>
      )}

      {isModalOpen.jogador && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(prev => ({ ...prev, jogador: false }))} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-black text-white mb-6">Inscrever Jogador</h3>
            <form onSubmit={saveJogador} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Tipo de Jogador</label>
                <select value={jogadorForm.is_aluno ? 'true' : 'false'} onChange={e => setJogadorForm(p => ({...p, is_aluno: e.target.value === 'true', aluno_id: '', name: ''}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm">
                  <option value="true">Aluno Matriculado (Da Casa)</option>
                  <option value="false">Jogador Externo</option>
                </select>
              </div>
              {jogadorForm.is_aluno ? (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Selecione o Aluno</label>
                  <select required value={jogadorForm.aluno_id} onChange={e => setJogadorForm(p => ({...p, aluno_id: e.target.value}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm">
                    <option value="">Selecione...</option>
                    {alunos.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nome do Jogador</label>
                  <input type="text" required value={jogadorForm.name} onChange={e => setJogadorForm(p => ({...p, name: e.target.value}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
              )}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Número da Camisa</label>
                <input type="number" min="1" max="99" required value={jogadorForm.number} onChange={e => setJogadorForm(p => ({...p, number: e.target.value}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase mt-2">Inscrever</button>
            </form>
          </div>
        </div>
      )}

      {/* JOGO MODAL */}
      {isModalOpen.jogo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(prev => ({ ...prev, jogo: false }))} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-black text-white mb-6">Agendar Partida</h3>
            <form onSubmit={saveJogo} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Equipe Casa</label>
                  <select required value={jogoForm.equipe_casa_id} onChange={e => setJogoForm(p => ({...p, equipe_casa_id: e.target.value}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm">
                    <option value="">Selecione...</option>
                    {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Equipe Visitante</label>
                  <select required value={jogoForm.equipe_visitante_id} onChange={e => setJogoForm(p => ({...p, equipe_visitante_id: e.target.value}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm">
                    <option value="">Selecione...</option>
                    {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Data</label>
                  <input type="date" required value={jogoForm.date} onChange={e => setJogoForm(p => ({...p, date: e.target.value}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Hora</label>
                  <input type="time" required value={jogoForm.time} onChange={e => setJogoForm(p => ({...p, time: e.target.value}))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase mt-2">Agendar</button>
            </form>
          </div>
        </div>
      )}


      {!selectedCampeonato ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-white">Torneios e Campeonatos</h3>
            {isAdmin && (
              <button onClick={() => { setCampeonatoForm({ id: null, name: '', start_date: '', end_date: '', status: 'active' }); setIsModalOpen(p => ({...p, campeonato: true})); }} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs uppercase">
                + Novo
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campeonatos.map(camp => (
              <div key={camp.id} onClick={() => selectCampeonato(camp)} className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 hover:border-emerald-500/50 cursor-pointer transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-white text-lg group-hover:text-emerald-400">{camp.name}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${camp.status === 'active' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-400'}`}>
                    {camp.status === 'active' ? 'Ativo' : 'Encerrado'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-semibold mb-2">{new Date(camp.start_date).toLocaleDateString('pt-BR')} até {new Date(camp.end_date).toLocaleDateString('pt-BR')}</div>
                <div className="flex gap-4 mt-4 pt-4 border-t border-slate-800/80">
                  <div className="text-center flex-1">
                    <div className="text-xl font-black text-white">{camp.equipes?.length || 0}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">Equipes</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-xl font-black text-white">{camp.jogos?.length || 0}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">Jogos</div>
                  </div>
                </div>
              </div>
            ))}
            {campeonatos.length === 0 && <div className="col-span-full text-slate-500 italic py-10 text-center">Nenhum campeonato criado.</div>}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedCampeonato(null)} className="text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-sm font-bold">← Voltar</button>
            <h2 className="text-2xl font-black text-white">{selectedCampeonato.name}</h2>
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedCampeonato.status === 'active' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-400'}`}>
              {selectedCampeonato.status === 'active' ? 'Em Andamento' : 'Encerrado'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* EQUIPES E JOGADORES */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-white">Equipes ({equipes.length})</h3>
                {isAdmin && (
                  <button onClick={() => { setEquipeForm({ name: '', coach_name: '' }); setIsModalOpen(p => ({...p, equipe: true})); }} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-1.5 px-3 rounded-xl text-xs uppercase">
                    + Nova Equipe
                  </button>
                )}
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {equipes.map(eq => (
                  <div key={eq.id} className="bg-slate-950/40 rounded-2xl border border-slate-850/60 overflow-hidden">
                    <div className="p-4 bg-slate-800/30 border-b border-slate-850/60 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white text-md">{eq.name}</div>
                        {eq.coach_name && <div className="text-xs text-slate-400">Técnico: {eq.coach_name}</div>}
                      </div>
                      {isAdmin && (
                        <button onClick={() => { setCurrentEquipeId(eq.id); setJogadorForm({ is_aluno: true, aluno_id: '', name: '', number: '' }); setIsModalOpen(p => ({...p, jogador: true})); }} className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-500/20">
                          + Inscrever
                        </button>
                      )}
                    </div>
                    <div className="p-3">
                      {eq.jogadores && eq.jogadores.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {eq.jogadores.map(j => (
                            <div key={j.id} className="flex justify-between items-center text-sm bg-slate-900 p-2 rounded-lg border border-slate-800">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className="font-black text-emerald-500 w-5">{j.number}</span>
                                <span className="text-slate-300 truncate" title={j.is_aluno ? j.aluno?.name : j.name}>{j.is_aluno ? j.aluno?.name : j.name} {j.is_aluno && <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded ml-1">Casa</span>}</span>
                              </div>
                              {isAdmin && (
                                <button onClick={() => deleteJogador(j.id)} className="text-red-500/70 hover:text-red-400 font-black ml-2 px-1">✕</button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-500 text-xs italic text-center py-2">Nenhum jogador inscrito.</div>
                      )}
                    </div>
                  </div>
                ))}
                {equipes.length === 0 && <div className="text-slate-500 italic text-sm text-center">Nenhuma equipe cadastrada.</div>}
              </div>
            </div>

            {/* JOGOS E SÚMULAS */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-white">Jogos & Resultados</h3>
                {isAdmin && (
                  <button onClick={() => { setJogoForm({ equipe_casa_id: '', equipe_visitante_id: '', date: '', time: '' }); setIsModalOpen(p => ({...p, jogo: true})); }} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-1.5 px-3 rounded-xl text-xs uppercase">
                    + Agendar
                  </button>
                )}
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {selectedCampeonato.jogos?.map(jogo => (
                  <div key={jogo.id} className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60 flex flex-col gap-4">
                    <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                      <div>{new Date(jogo.date).toLocaleDateString('pt-BR')} {jogo.time && `às ${jogo.time.slice(0,5)}`}</div>
                      <span className={`px-2 py-0.5 rounded uppercase ${jogo.status === 'finished' ? 'bg-slate-800 text-slate-300' : 'bg-amber-500/10 text-amber-500'}`}>
                        {jogo.status === 'finished' ? 'Encerrado' : 'Agendado'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 px-2">
                      <div className="text-right flex-1 font-black text-white text-sm sm:text-base truncate" title={jogo.equipeCasa?.name}>{jogo.equipeCasa?.name}</div>
                      <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-black text-xl text-emerald-400 min-w-16 text-center shadow-inner">
                        {jogo.gols_casa} <span className="text-slate-600 font-normal">x</span> {jogo.gols_visitante}
                      </div>
                      <div className="flex-1 font-black text-white text-sm sm:text-base truncate" title={jogo.equipeVisitante?.name}>{jogo.equipeVisitante?.name}</div>
                    </div>

                    <div className="flex justify-center gap-2 mt-2 pt-3 border-t border-slate-850/60">
                      <button onClick={() => openSumula(jogo)} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs border border-slate-700 hover:border-slate-600">
                        Abrir Súmula
                      </button>
                      {jogo.status !== 'finished' && isAdmin && (
                        <button onClick={() => finalizarJogo(jogo.id)} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold py-1.5 px-4 rounded-lg text-xs border border-emerald-500/20">
                          Encerrar Partida
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {(!selectedCampeonato.jogos || selectedCampeonato.jogos.length === 0) && (
                  <div className="text-slate-500 italic text-sm text-center">Nenhum jogo agendado.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CampeonatosTab;
