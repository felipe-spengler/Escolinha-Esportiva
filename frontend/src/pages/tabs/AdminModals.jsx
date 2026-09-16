import React from 'react';

function AdminModals({ 
  isModalOpen, setIsModalOpen, 
  historicoAluno, historicoData, 
  produtoForm, setProdutoForm, handleSaveProduto,
  fluxoForm, setFluxoForm, handleSaveFluxo,
  avaliacaoForm, setAvaliacaoForm, handleSaveAvaliacao, alunos, turmas,
  professorForm, setProfessorForm, handleSaveProfessor,
  alunoForm, setAlunoForm, handleSaveAluno, responsaveis, handlePhotoUpload,
  turmaForm, setTurmaForm, handleSaveTurma, professores,
  responsavelForm, setResponsavelForm, handleSaveResponsavel
}) {
  if (!Object.values(isModalOpen).some(Boolean)) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen({ aluno: false, responsavel: false, turma: false, professor: false, produto: false, fluxo: false, avaliacao: false, historicoPagamento: false })} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <button 
          onClick={() => setIsModalOpen({ aluno: false, responsavel: false, turma: false, professor: false, produto: false, fluxo: false, avaliacao: false, historicoPagamento: false })}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors z-10"
        >
          ✕
        </button>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          
          {/* HISTORICO PAGAMENTO MODAL */}
          {isModalOpen.historicoPagamento && historicoAluno && (
            <div>
              <h3 className="text-lg font-black text-white mb-2">Histórico de Pagamentos</h3>
              <div className="text-sm font-bold text-slate-400 mb-6">Aluno: {historicoAluno.name}</div>
              
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {historicoData.map(m => (
                  <div key={m.id} className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60 flex flex-col gap-2">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <div className="text-white font-bold">Vencimento: {new Date(m.due_date).toLocaleDateString('pt-BR')}</div>
                        <div className="text-slate-500 text-xs">Valor: R$ {parseFloat(m.amount).toFixed(2)}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        m.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                        m.status === 'overdue' ? 'bg-red-500/10 text-red-400 border border-red-500/25' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                      }`}>
                        {m.status === 'paid' ? 'Pago' : m.status === 'overdue' ? 'Vencida' : 'Pendente'}
                      </span>
                    </div>
                    {m.status === 'paid' && m.paid_at && (
                      <div className="text-[10px] text-emerald-500 font-semibold mt-1 border-t border-slate-850 pt-2">
                        <div className="mb-0.5">Pago em: {new Date(m.paid_at).toLocaleDateString('pt-BR')}</div>
                        <div>Forma de Pgto: {m.payment_method || 'Manual / Desconhecido'}</div>
                      </div>
                    )}
                  </div>
                ))}
                {historicoData.length === 0 && (
                  <div className="text-slate-500 py-6 text-center italic">Nenhuma mensalidade encontrada.</div>
                )}
              </div>
            </div>
          )}

          {/* PRODUTO FORM MODAL */}
          {isModalOpen.produto && (
            <div>
              <h3 className="text-lg font-black text-white mb-6">{produtoForm.id ? 'Editar Produto' : 'Adicionar Produto'}</h3>
              <form onSubmit={(e) => { handleSaveProduto(e); setIsModalOpen({ ...isModalOpen, produto: false }); }} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nome do Produto</label>
                  <input type="text" value={produtoForm.name} onChange={(e) => setProdutoForm(prev => ({ ...prev, name: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Preço de Venda (R$)</label>
                  <input type="number" step="0.01" value={produtoForm.price} onChange={(e) => setProdutoForm(prev => ({ ...prev, price: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Quantidade em Estoque</label>
                  <input type="number" value={produtoForm.stock_quantity} onChange={(e) => setProdutoForm(prev => ({ ...prev, stock_quantity: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase">
                  Salvar
                </button>
              </form>
            </div>
          )}

          {/* FLUXO CAIXA FORM MODAL */}
          {isModalOpen.fluxo && (
            <div>
              <h3 className="text-lg font-black text-white mb-6">Lançar Despesa / Receita</h3>
              <form onSubmit={(e) => { handleSaveFluxo(e); setIsModalOpen({ ...isModalOpen, fluxo: false }); }} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Tipo de Lançamento</label>
                  <select value={fluxoForm.type} onChange={(e) => setFluxoForm(prev => ({ ...prev, type: e.target.value }))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm">
                    <option value="expense">Saída (Despesa)</option>
                    <option value="income">Entrada (Receita)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Descrição / Motivo</label>
                  <input type="text" value={fluxoForm.description} onChange={(e) => setFluxoForm(prev => ({ ...prev, description: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Valor (R$)</label>
                  <input type="number" step="0.01" value={fluxoForm.amount} onChange={(e) => setFluxoForm(prev => ({ ...prev, amount: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Data</label>
                  <input type="date" value={fluxoForm.date} onChange={(e) => setFluxoForm(prev => ({ ...prev, date: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase">
                  Lançar no Caixa
                </button>
              </form>
            </div>
          )}

          {/* AVALIACAO FORM MODAL */}
          {isModalOpen.avaliacao && (
            <div>
              <h3 className="text-lg font-black text-white mb-6">{avaliacaoForm.id ? 'Editar Avaliação' : 'Registrar Avaliação'}</h3>
              <form onSubmit={(e) => { handleSaveAvaliacao(e); setIsModalOpen({ ...isModalOpen, avaliacao: false }); }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Aluno</label>
                    <select
                      value={avaliacaoForm.aluno_id}
                      onChange={(e) => setAvaliacaoForm(prev => ({ ...prev, aluno_id: e.target.value }))}
                      required
                      className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm"
                    >
                      <option value="">Selecione...</option>
                      {alunos.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Data da Avaliação</label>
                    <input
                      type="date"
                      value={avaliacaoForm.date}
                      onChange={(e) => setAvaliacaoForm(prev => ({ ...prev, date: e.target.value }))}
                      required
                      className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-5 border-t border-slate-800/80 pt-6">
                  {[
                    { key: 'passe', label: 'Passe' },
                    { key: 'chute', label: 'Chute' },
                    { key: 'dominio', label: 'Domínio de Bola' },
                    { key: 'condicionamento', label: 'Condicionamento Físico' },
                    { key: 'disciplina', label: 'Disciplina e Postura' },
                  ].map((field) => (
                    <div key={field.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-850/50">
                      <span className="text-sm font-semibold text-slate-300">{field.label}</span>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={avaliacaoForm[field.key]}
                          onChange={(e) => setAvaliacaoForm(prev => ({ ...prev, [field.key]: parseInt(e.target.value) }))}
                          className="w-36 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <span className="font-bold text-emerald-400 w-6 text-right">{avaliacaoForm[field.key]}/10</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Parecer Descritivo</label>
                  <textarea
                    rows="3"
                    value={avaliacaoForm.parecer}
                    onChange={(e) => setAvaliacaoForm(prev => ({ ...prev, parecer: e.target.value }))}
                    placeholder="Descreva a evolução técnica, pontos fortes e fracos do aluno..."
                    className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all uppercase text-xs tracking-wider"
                >
                  {avaliacaoForm.id ? 'Salvar Alterações' : 'Registrar Avaliação'}
                </button>
              </form>
            </div>
          )}

          {/* PROFESSOR FORM MODAL */}
          {isModalOpen.professor && (
            <div>
              <h3 className="text-lg font-black text-white mb-6">{professorForm.id ? 'Editar Professor' : 'Cadastrar Professor'}</h3>
              <form onSubmit={(e) => { handleSaveProfessor(e); setIsModalOpen({ ...isModalOpen, professor: false }); }} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nome Completo</label>
                  <input type="text" value={professorForm.name} onChange={(e) => setProfessorForm(prev => ({ ...prev, name: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">E-mail (Login)</label>
                  <input type="email" value={professorForm.email} onChange={(e) => setProfessorForm(prev => ({ ...prev, email: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Senha {professorForm.id && '(Deixe vazio para manter)'}</label>
                  <input type="password" value={professorForm.password} onChange={(e) => setProfessorForm(prev => ({ ...prev, password: e.target.value }))} required={!professorForm.id} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase">
                  {professorForm.id ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </form>
            </div>
          )}

          {/* ALUNO FORM MODAL */}
          {isModalOpen.aluno && (
            <div>
              <h3 className="text-lg font-black text-white mb-6">{alunoForm.id ? 'Editar Aluno' : 'Cadastrar Aluno'}</h3>
              <form onSubmit={(e) => { handleSaveAluno(e); setIsModalOpen({ ...isModalOpen, aluno: false }); }} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nome Completo</label>
                  <input type="text" value={alunoForm.name} onChange={(e) => setAlunoForm(prev => ({ ...prev, name: e.target.value }))} required placeholder="Nome do aluno" className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Data de Nascimento</label>
                  <input type="date" value={alunoForm.birth_date} onChange={(e) => setAlunoForm(prev => ({ ...prev, birth_date: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Responsável</label>
                  <select value={alunoForm.responsavel_id} onChange={(e) => setAlunoForm(prev => ({ ...prev, responsavel_id: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm">
                    <option value="">Selecione...</option>
                    {responsaveis.map(r => (<option key={r.id} value={r.id}>{r.name} ({r.cpf})</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Turmas</label>
                  <select multiple value={alunoForm.turma_ids} onChange={(e) => setAlunoForm(prev => ({ ...prev, turma_ids: Array.from(e.target.selectedOptions, option => parseInt(option.value)) }))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm min-h-24">
                    {turmas.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                  <span className="text-[10px] text-slate-500 mt-1 block">Segure Ctrl (ou Cmd) para selecionar mais de uma</span>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Ficha Médica</label>
                  <textarea rows="2" value={alunoForm.medical_notes} onChange={(e) => setAlunoForm(prev => ({ ...prev, medical_notes: e.target.value }))} placeholder="Alergias, restrições físicas, etc..." className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Foto (Arquivo)</label>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full bg-slate-950 border border-slate-850 text-slate-300 rounded-xl px-4 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20" />
                  {alunoForm.photo && alunoForm.photo.startsWith('data:image') && <p className="text-xs text-emerald-500 mt-1">✓ Imagem carregada</p>}
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Status</label>
                  <select value={alunoForm.status} onChange={(e) => setAlunoForm(prev => ({ ...prev, status: e.target.value }))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="suspended">Suspenso</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Mensalidade (R$)</label>
                    <input type="number" step="0.01" value={alunoForm.mensalidade_valor} onChange={(e) => setAlunoForm(prev => ({ ...prev, mensalidade_valor: e.target.value }))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Vencimento</label>
                    <input type="number" min="1" max="31" value={alunoForm.dia_vencimento} onChange={(e) => setAlunoForm(prev => ({ ...prev, dia_vencimento: e.target.value }))} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase">
                  {alunoForm.id ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </form>
            </div>
          )}

          {/* TURMA FORM MODAL */}
          {isModalOpen.turma && (
            <div>
              <h3 className="text-lg font-black text-white mb-6">{turmaForm.id ? 'Editar Turma' : 'Cadastrar Turma'}</h3>
              <form onSubmit={(e) => { handleSaveTurma(e); setIsModalOpen({ ...isModalOpen, turma: false }); }} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nome da Turma</label>
                  <input type="text" value={turmaForm.name} onChange={(e) => setTurmaForm(prev => ({ ...prev, name: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Horário / Dias</label>
                  <input type="text" value={turmaForm.schedule} onChange={(e) => setTurmaForm(prev => ({ ...prev, schedule: e.target.value }))} required placeholder="Ex: Seg/Qua 14:00" className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Professor</label>
                  <select value={turmaForm.professor_id} onChange={(e) => setTurmaForm(prev => ({ ...prev, professor_id: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm">
                    <option value="">Selecione...</option>
                    {professores.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </div>
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase">
                  {turmaForm.id ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </form>
            </div>
          )}

          {/* RESPONSAVEL FORM MODAL */}
          {isModalOpen.responsavel && (
            <div>
              <h3 className="text-lg font-black text-white mb-6">{responsavelForm.id ? 'Editar Responsável' : 'Cadastrar Responsável'}</h3>
              <form onSubmit={(e) => { handleSaveResponsavel(e); setIsModalOpen({ ...isModalOpen, responsavel: false }); }} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nome Completo</label>
                  <input type="text" value={responsavelForm.name} onChange={(e) => setResponsavelForm(prev => ({ ...prev, name: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">E-mail</label>
                  <input type="email" value={responsavelForm.email} onChange={(e) => setResponsavelForm(prev => ({ ...prev, email: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Senha {responsavelForm.id ? '(Deixe em branco para manter)' : ''}</label>
                  <input type="password" value={responsavelForm.password} onChange={(e) => setResponsavelForm(prev => ({ ...prev, password: e.target.value }))} required={!responsavelForm.id} className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Telefone</label>
                  <input type="text" value={responsavelForm.phone} onChange={(e) => setResponsavelForm(prev => ({ ...prev, phone: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">CPF</label>
                  <input type="text" value={responsavelForm.cpf} onChange={(e) => setResponsavelForm(prev => ({ ...prev, cpf: e.target.value }))} required className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition-all text-xs uppercase">
                  {responsavelForm.id ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default AdminModals;
