import React from 'react';

function OverviewTab({ dashboardData }) {
  if (!dashboardData) return null;
  
  return (
    <div className="space-y-8">
      {/* Metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between h-32">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Alunos Ativos</span>
          <div className="text-3xl font-black text-emerald-400">{dashboardData.total_alunos_ativos}</div>
          <div className="absolute -right-2 -bottom-4 text-slate-800/30 text-6xl font-black select-none">RUN</div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between h-32">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Alunos Inadimplentes</span>
          <div className="text-3xl font-black text-red-400">{dashboardData.inadimplencia_mes}</div>
          <div className="absolute -right-2 -bottom-4 text-slate-800/30 text-6xl font-black select-none">DEB</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between h-32">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">A Receber no Mês</span>
          <div className="text-2xl font-black text-amber-400">R$ {dashboardData.mensalidades_pendentes_valor?.toFixed(2) || '0.00'}</div>
          <div className="absolute -right-2 -bottom-4 text-slate-800/30 text-6xl font-black select-none">PEN</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between h-32">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Receitas do Mês</span>
          <div className="text-2xl font-black text-emerald-400">R$ {dashboardData.receitas_mes.toFixed(2)}</div>
          <div className="absolute -right-2 -bottom-4 text-slate-800/30 text-6xl font-black select-none">REC</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between h-32">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Despesas do Mês</span>
          <div className="text-2xl font-black text-red-400">R$ {dashboardData.despesas_mes.toFixed(2)}</div>
          <div className="absolute -right-2 -bottom-4 text-slate-800/30 text-6xl font-black select-none">DES</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between h-32">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saldo do Mês</span>
          <div className={`text-2xl font-black ${dashboardData.saldo_mes >= 0 ? 'text-blue-400' : 'text-orange-500'}`}>
            R$ {dashboardData.saldo_mes?.toFixed(2) || '0.00'}
          </div>
          <div className="absolute -right-2 -bottom-4 text-slate-800/30 text-6xl font-black select-none">SAL</div>
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
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col h-full">
          <h3 className="text-lg font-black text-white mb-4">🎈 Aniversariantes do Mês</h3>
          <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
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
      </div>
    </div>
  );
}

export default OverviewTab;
