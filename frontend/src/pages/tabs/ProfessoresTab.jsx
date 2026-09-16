import React from 'react';

function ProfessoresTab({ professores, isAdmin, setProfessorForm, setIsModalOpen, isModalOpen, handleEditProfessor, handleDeleteProfessor }) {
  if (!isAdmin) return null;
  return (
    <div className="grid grid-cols-1 gap-8">
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
  );
}

export default ProfessoresTab;
