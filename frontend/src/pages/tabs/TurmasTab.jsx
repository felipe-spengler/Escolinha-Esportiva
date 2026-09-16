import React from 'react';

function TurmasTab({ turmas, isAdmin, setTurmaForm, setIsModalOpen, isModalOpen, handleEditTurma, handleDeleteTurma }) {
  if (!isAdmin) return null;
  return (
    <div className="grid grid-cols-1 gap-8">
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
  );
}

export default TurmasTab;
