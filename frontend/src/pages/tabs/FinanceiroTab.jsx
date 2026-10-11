import React from 'react';

function FinanceiroTab({ isAdmin, mensalidadeFilter, setMensalidadeFilter, mensalidadesList, handleBaixaManual, handleSaveSettings, settingsForm, setSettingsForm }) {
  if (!isAdmin) return null;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h3 className="text-lg font-black text-white">Mensalidades</h3>
          <div className="flex gap-2">
            <select
              value={mensalidadeFilter}
              onChange={(e) => setMensalidadeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-850 text-white text-xs rounded-lg px-2.5 py-1.5"
            >
              <option value="">Todos Status</option>
              <option value="paid">Paga</option>
              <option value="pending">Pendente</option>
              <option value="overdue">Vencida</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {mensalidadesList.filter(m => !mensalidadeFilter || m.status === mensalidadeFilter).map(m => (
            <div key={m.id} className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60 flex flex-col gap-4">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <div className="text-white font-bold">{m.aluno?.name}</div>
                  <div className="text-slate-500 text-xs">Vence: {new Date(m.due_date).toLocaleDateString('pt-BR')} | R$ {parseFloat(m.amount).toFixed(2)}</div>
                  {m.status === 'paid' && m.paid_at && (
                    <div className="text-[10px] text-emerald-500 font-semibold mt-1">
                      Pago em: {new Date(m.paid_at).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  m.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                  m.status === 'overdue' ? 'bg-red-500/10 text-red-400 border border-red-500/25' :
                  'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                }`}>
                  {m.status === 'paid' ? 'Pago' : m.status === 'overdue' ? 'Vencida' : 'Pendente'}
                </span>
              </div>
              {m.status !== 'paid' && (
                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-850/80 items-stretch sm:items-center justify-end">
                  <button
                    onClick={() => handleBaixaManual(m.id)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs"
                  >
                    Baixa Manual
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit">
        <h3 className="text-lg font-black text-white mb-6">Configurações de Taxas</h3>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Juros Mensal (%)</label>
            <input
              type="number"
              step="0.01"
              value={settingsForm.juros_mensal}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, juros_mensal: e.target.value }))}
              required
              placeholder="1.00"
              className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Multa por Atraso (%)</label>
            <input
              type="number"
              step="0.01"
              value={settingsForm.multa_atraso}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, multa_atraso: e.target.value }))}
              required
              placeholder="2.00"
              className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Método de Cobrança</label>
            <select
              value={settingsForm.payment_method}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, payment_method: e.target.value }))}
              required
              className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm"
            >
              <option value="manual">Manual (Chave PIX Própria)</option>
              <option value="asaas">Automático (Integração ASAAS)</option>
            </select>
          </div>
          {settingsForm.payment_method === 'manual' && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Sua Chave PIX</label>
              <input
                type="text"
                value={settingsForm.pix_key || ''}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, pix_key: e.target.value }))}
                placeholder="Ex: 123.456.789-00 ou email@exemplo.com"
                className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm"
              />
              <p className="text-slate-500 text-[10px] mt-1">Essa chave será exibida para os pais copiarem e pagarem no aplicativo do banco.</p>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase"
          >
            Salvar Configurações
          </button>
        </form>
      </div>
    </div>
  );
}

export default FinanceiroTab;
