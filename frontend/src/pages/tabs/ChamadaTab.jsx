import React from 'react';

function ChamadaTab({ turmas, chamadaState, fetchChamadaAlunos, handleTogglePresenca, handleSaveChamada }) {
  return (
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
  );
}

export default ChamadaTab;
