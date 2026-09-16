import React from 'react';

function FluxoTab({ fluxoCaixa, isAdmin, setFluxoForm, setIsModalOpen, isModalOpen }) {
  if (!isAdmin) return null;
  return (
    <div className="grid grid-cols-1 gap-8">
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
    </div>
  );
}

export default FluxoTab;
