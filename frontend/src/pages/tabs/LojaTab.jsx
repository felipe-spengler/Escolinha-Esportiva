import React from 'react';

function LojaTab({ isAdmin, setProdutoForm, setIsModalOpen, isModalOpen, handleVendaProduto, vendaForm, setVendaForm, produtos }) {
  if (!isAdmin) return null;
  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-white">PDV - Venda de Uniformes / Acessórios</h3>
          <button onClick={() => { setProdutoForm({ id: null, name: '', price: '', stock_quantity: '' }); setIsModalOpen({ ...isModalOpen, produto: true }); }} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs uppercase">
            + Adicionar Produto
          </button>
        </div>
        
        <form onSubmit={handleVendaProduto} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60 items-end">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Selecione o Produto</label>
            <select
              value={vendaForm.produto_id}
              onChange={(e) => setVendaForm(prev => ({ ...prev, produto_id: e.target.value }))}
              required
              className="w-full bg-slate-950 border border-slate-850 text-white rounded-lg px-3 py-2 text-xs"
            >
              <option value="">Selecione...</option>
              {produtos.map(p => (
                <option key={p.id} value={p.id} disabled={p.stock_quantity <= 0}>
                  {p.name} - R$ {parseFloat(p.price).toFixed(2)} ({p.stock_quantity} no estoque)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Quantidade</label>
            <input
              type="number"
              min="1"
              value={vendaForm.quantity}
              onChange={(e) => setVendaForm(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
              required
              className="w-full bg-slate-950 border border-slate-850 text-white rounded-lg px-3 py-2 text-xs"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 rounded-lg text-xs uppercase"
          >
            Registrar Venda
          </button>
        </form>

        <h3 className="text-md font-bold text-slate-400 mb-4">Catálogo de Produtos</h3>
        <div className="space-y-3">
          {produtos.map(p => (
            <div key={p.id} className="flex justify-between bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60 items-center">
              <div>
                <div className="text-white font-bold">{p.name}</div>
                <div className="text-slate-500 text-xs mt-0.5">Preço: R$ {parseFloat(p.price).toFixed(2)} | Estoque: {p.stock_quantity} unidades</div>
              </div>
              <button
                onClick={() => { setProdutoForm({ id: p.id, name: p.name, price: p.price, stock_quantity: p.stock_quantity }); setIsModalOpen({ ...isModalOpen, produto: true }); }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1.5 px-3 rounded-lg text-xs"
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LojaTab;
