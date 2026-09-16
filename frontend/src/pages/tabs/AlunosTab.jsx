import React from 'react';

function AlunosTab({ alunos, isAdmin, setAlunoForm, setIsModalOpen, isModalOpen, handleEditAluno, handleDeleteAluno, handleOpenHistorico }) {
  if (!isAdmin) return null;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                <button
                  onClick={() => handleOpenHistorico(a)}
                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold py-1.5 px-3 rounded-lg text-xs border border-blue-500/20 hover:border-blue-500/30"
                >
                  Histórico Pgto
                </button>
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
  );
}

export default AlunosTab;
