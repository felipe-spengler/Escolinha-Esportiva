import React from 'react';

function AvaliacaoTab({ turmas, alunos, avaliacoesList, avaliacaoFilterTurma, setAvaliacaoFilterTurma, avaliacaoFilterAluno, setAvaliacaoFilterAluno, setAvaliacaoForm, setIsModalOpen, isModalOpen, handleDeleteAvaliacao }) {
  return (
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
  );
}

export default AvaliacaoTab;
