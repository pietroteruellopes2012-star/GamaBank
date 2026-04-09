import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [activities, setActivities] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [bankBalance, setBankBalance] = useState(0);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "" });

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      toast.error("Acesso negado!");
      navigate("/");
      return;
    }
    loadData();
    loadAllClasses();
  }, [activeTab]);

  const loadAllClasses = async () => {
    try {
      const res = await axios.get(`${API}/classes`);
      setAllClasses(res.data);
    } catch (error) {
      console.error("Erro ao carregar turmas");
    }
  };

  const loadData = async () => {
    try {
      if (activeTab === "students") {
        const res = await axios.get(`${API}/students`);
        setStudents(res.data);
      } else if (activeTab === "benefits") {
        const res = await axios.get(`${API}/benefits`);
        setBenefits(res.data);
      } else if (activeTab === "activities") {
        const res = await axios.get(`${API}/activities`);
        setActivities(res.data);
      } else if (activeTab === "transactions") {
        const res = await axios.get(`${API}/transactions`);
        setTransactions(res.data);
      } else if (activeTab === "bank") {
        const res = await axios.get(`${API}/bank`);
        setBankBalance(res.data.balance);
      } else if (activeTab === "rooms") {
        const res = await axios.get(`${API}/classes`);
        setClasses(res.data);
      }
    } catch (error) {
      toast.error("Erro ao carregar dados");
    }
  };

  const handleSave = async () => {
    try {
      if (activeTab === "bank") {
        await axios.put(`${API}/admin/bank`, { balance: formData.balance });
        toast.success("Banco atualizado!");
      } else if (activeTab === "rooms") {
        if (editing?.id) {
          await axios.put(`${API}/admin/classes/${editing.id}`, formData);
          toast.success("Turma atualizada!");
        } else {
          await axios.post(`${API}/admin/classes`, formData);
          toast.success("Turma criada!");
        }
      } else if (editing?.id) {
        await axios.put(`${API}/admin/${activeTab}/${editing.id}`, formData);
        toast.success("Atualizado!");
      } else {
        await axios.post(`${API}/admin/${activeTab}`, formData);
        toast.success("Criado!");
      }
      setEditing(null);
      setFormData({});
      loadData();
      if (activeTab === "students") {
        loadAllClasses();
      }
    } catch (error) {
      toast.error("Erro ao salvar");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Confirma exclusão?")) return;
    try {
      const endpoint = activeTab === "rooms" ? "classes" : activeTab;
      await axios.delete(`${API}/admin/${endpoint}/${id}`);
      toast.success("Excluído!");
      loadData();
    } catch (error) {
      toast.error("Erro ao excluir");
    }
  };

  const startEdit = (item) => {
    setEditing(item);
    setFormData(item);
  };

  const startNew = () => {
    setEditing({ id: null });
    if (activeTab === "students") {
      setFormData({ name: "", class_id: allClasses[0]?.id || "", class_year: allClasses[0]?.year || "", balance: 0, password: "1234" });
    } else if (activeTab === "benefits") {
      setFormData({ name: "", description: "", cost: 0, image_url: "" });
    } else if (activeTab === "activities") {
      setFormData({ name: "", description: "", reward: 0, image_url: "" });
    } else if (activeTab === "rooms") {
      setFormData({ name: "", year: "" });
    }
  };

  const generateImageFromName = (name) => {
    if (!name || name.trim() === "") return "";
    const n = name.toLowerCase();
    const imageMap = {
      'prova|teste|questão|exame': 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400',
      'lugar|sala|sentar|cadeira': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
      'lição|casa|dever|tarefa': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
      'trabalho|grupo|equipe|apresentar': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
      'atraso|tempo|relógio|chegar': 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=400',
      'redação|escrever|texto|tema': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400',
      'ler|livro|apostila|leitura': 'https://images.unsplash.com/photo-1645891913640-9a75931c6235?w=400',
      'participar|aula|pergunta|discussão': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
      'ajudar|colega|dúvida|ensinar': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
      'resumo|criativo|conteúdo': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400'
    };
    for (const [keywords, url] of Object.entries(imageMap)) {
      if (keywords.split('|').some(k => n.includes(k))) return url;
    }
    return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400';
  };

  const changePassword = async () => {
    if (!passwordForm.current || !passwordForm.new) {
      toast.error("Preencha todos os campos");
      return;
    }
    try {
      await axios.post(`${API}/admin/change-password`, {
        current_password: passwordForm.current,
        new_password: passwordForm.new,
      });
      toast.success("Senha alterada!");
      setPasswordForm({ current: "", new: "" });
    } catch (error) {
      toast.error("Senha atual incorreta!");
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl sm:text-4xl font-black mb-6 sm:mb-8" style={{ fontFamily: "Unbounded, sans-serif", color: "#6BB4E8" }}>
            Painel Administrativo
          </h1>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {["students", "benefits", "activities", "bank", "rooms", "transactions", "settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-4 py-2 rounded-full font-bold border-2 border-[#6BB4E8] transition-all text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-[#6BB4E8] text-white shadow-[3px_3px_0_#4A90C8]"
                    : "bg-white text-[#4A90C8] shadow-[2px_2px_0_#6BB4E8]"
                }`}
              >
                {tab === "students" ? "Alunos" : tab === "benefits" ? "Benefícios" : tab === "activities" ? "Atividades" : tab === "bank" ? "Banco" : tab === "rooms" ? "Turmas" : tab === "transactions" ? "Extratos" : "Senha"}
              </button>
            ))}
          </div>

          <div className="neo-card p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: "#6BB4E8" }}>
                {activeTab === "students" ? "Alunos" : activeTab === "benefits" ? "Benefícios" : activeTab === "activities" ? "Atividades" : activeTab === "bank" ? "Banco" : activeTab === "rooms" ? "Turmas" : activeTab === "transactions" ? "Extratos" : "Alterar Senha"}
              </h2>
              {!["transactions", "bank", "settings"].includes(activeTab) && (
                <Button onClick={startNew} className="neo-button bg-[#6BB4E8] hover:bg-[#6BB4E8] text-white rounded-lg w-full sm:w-auto">
                  <Plus size={20} weight="bold" /> Adicionar
                </Button>
              )}
              {activeTab === "bank" && (
                <Button onClick={() => { setEditing({ id: null }); setFormData({ balance: bankBalance }); }} className="neo-button bg-[#6BB4E8] hover:bg-[#6BB4E8] text-white rounded-lg w-full sm:w-auto">
                  <Pencil size={20} weight="bold" /> Editar Saldo
                </Button>
              )}
            </div>

            {activeTab === "students" && (
              <div className="space-y-2">
                {students.map((s) => (
                  <div key={s.id} className="flex justify-between items-center p-4 bg-[#E8F4FA] rounded-lg border-2 border-[#6BB4E8]">
                    <div>
                      <p className="font-bold text-[#4A90C8]">{s.name}</p>
                      <p className="text-sm text-[#4A90C8]">
                        {allClasses.find(c => c.id === s.class_id)?.name || s.class_year || "Sem turma"} - {s.balance} gamas
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(s)} className="p-2 bg-[#6BB4E8] text-white rounded-lg">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-2 bg-red-500 text-white rounded-lg">
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "benefits" && (
              <div className="space-y-2">
                {benefits.map((b) => (
                  <div key={b.id} className="flex justify-between items-center p-4 bg-[#E8F4FA] rounded-lg border-2 border-[#6BB4E8]">
                    <div>
                      <p className="font-bold text-[#4A90C8]">{b.name}</p>
                      <p className="text-sm text-[#4A90C8]">{b.cost} gamas</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(b)} className="p-2 bg-[#6BB4E8] text-white rounded-lg">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="p-2 bg-red-500 text-white rounded-lg">
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "activities" && (
              <div className="space-y-2">
                {activities.map((a) => (
                  <div key={a.id} className="flex justify-between items-center p-4 bg-[#E8F4FA] rounded-lg border-2 border-[#6BB4E8]">
                    <div>
                      <p className="font-bold text-[#4A90C8]">{a.name}</p>
                      <p className="text-sm text-[#4A90C8]">+{a.reward} gamas</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(a)} className="p-2 bg-[#6BB4E8] text-white rounded-lg">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="p-2 bg-red-500 text-white rounded-lg">
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "bank" && (
              <div className="text-center py-8">
                <p className="text-[#4A90C8] mb-4">Saldo do Banco de Gamas</p>
                <p className="text-6xl font-black gama-number" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                  {bankBalance}
                </p>
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="space-y-2">
                {transactions.map((t) => (
                  <div key={t.id} className="flex justify-between items-center p-4 bg-[#E8F4FA] rounded-lg border-2 border-[#6BB4E8]">
                    <div className="flex-1">
                      <p className="font-bold text-[#4A90C8]">{t.student_name}</p>
                      <p className="text-sm text-[#4A90C8]">{t.description}</p>
                      <p className="text-xs text-[#4A90C8]">{new Date(t.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`text-2xl font-black ${t.type === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'add' ? '+' : '-'}{t.amount}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(t)} className="p-2 bg-[#6BB4E8] text-white rounded-lg">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="p-2 bg-red-500 text-white rounded-lg">
                          <Trash size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "rooms" && (
              <div className="space-y-2">
                {classes.map((c) => (
                  <div key={c.id} className="flex justify-between items-center p-4 bg-[#E8F4FA] rounded-lg border-2 border-[#6BB4E8]">
                    <div>
                      <p className="font-bold text-[#4A90C8]">{c.name}</p>
                      <p className="text-sm text-[#4A90C8]">Ano: {c.year}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(c)} className="p-2 bg-[#6BB4E8] text-white rounded-lg">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-500 text-white rounded-lg">
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#6BB4E8]">Alterar Senha do Admin</h3>
                  <p className="text-[#4A90C8] mb-4">Digite a senha atual para criar uma nova</p>
                  <Input
                    type="password"
                    placeholder="Senha Atual"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="border-2 border-[#6BB4E8]"
                  />
                  <Input
                    type="password"
                    placeholder="Nova Senha"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="border-2 border-[#6BB4E8]"
                  />
                  <Button onClick={changePassword} className="w-full neo-button bg-[#6BB4E8] hover:bg-[#6BB4E8] text-white rounded-lg">
                    Alterar Senha Admin
                  </Button>
                </div>

                <div className="border-t-2 border-[#6BB4E8] pt-8 space-y-4">
                  <h3 className="text-xl font-bold text-[#6BB4E8]">Gerenciar Senhas dos Alunos</h3>
                  <p className="text-[#4A90C8] mb-4">Clique em um aluno para editar sua senha</p>
                  <div className="space-y-2">
                    {students.map((s) => (
                      <div key={s.id} className="flex justify-between items-center p-4 bg-[#E8F4FA] rounded-lg border-2 border-[#6BB4E8]">
                        <div>
                          <p className="font-bold text-[#4A90C8]">{s.name}</p>
                          <p className="text-sm text-[#4A90C8]">{allClasses.find(c => c.id === s.class_id)?.name || "Sem turma"}</p>
                        </div>
                        <Button
                          onClick={() => {
                            const newPass = prompt(`Nova senha para ${s.name}:`, s.password || "1234");
                            if (newPass) {
                              axios.put(`${API}/admin/students/${s.id}/password`, { password: newPass })
                                .then(() => { toast.success("Senha atualizada!"); loadData(); })
                                .catch(() => toast.error("Erro ao atualizar senha"));
                            }
                          }}
                          className="neo-button bg-[#6BB4E8] hover:bg-[#6BB4E8] text-white rounded-lg text-sm px-4 py-2"
                        >
                          <Pencil size={16} weight="bold" className="mr-2" /> Editar Senha
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {editing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-xl border-2 border-[#6BB4E8] shadow-[6px_6px_0_#6BB4E8] w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold" style={{ color: "#6BB4E8" }}>
                    {editing.id ? "Editar" : "Novo"}
                  </h3>
                  <button onClick={() => setEditing(null)} className="text-[#4A90C8]">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-3">
                  {activeTab === "bank" && (
                    <Input
                      type="number"
                      placeholder="Saldo do Banco"
                      value={formData.balance || 0}
                      onChange={(e) => setFormData({ balance: parseInt(e.target.value) })}
                      className="border-2 border-[#6BB4E8]"
                    />
                  )}

                  {activeTab === "transactions" && (
                    <>
                      <Input
                        type="number"
                        placeholder="Quantidade"
                        value={formData.amount || 0}
                        onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                        className="border-2 border-[#6BB4E8]"
                      />
                      <Input
                        placeholder="Descrição"
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="border-2 border-[#6BB4E8]"
                      />
                      <select
                        value={formData.type || "add"}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full p-2 border-2 border-[#6BB4E8] rounded-lg"
                      >
                        <option value="add">Adicionar</option>
                        <option value="subtract">Remover</option>
                      </select>
                    </>
                  )}

                  {activeTab === "students" && (
                    <>
                      <Input
                        placeholder="Nome"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="border-2 border-[#6BB4E8]"
                      />
                      <select
                        value={formData.class_id || ""}
                        onChange={(e) => {
                          const selectedClass = allClasses.find(c => c.id === e.target.value);
                          setFormData({ 
                            ...formData, 
                            class_id: e.target.value,
                            class_year: selectedClass?.year || ""
                          });
                        }}
                        className="w-full p-2 border-2 border-[#6BB4E8] rounded-lg"
                      >
                        <option value="">Selecione a turma</option>
                        {allClasses.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        placeholder="Saldo"
                        value={formData.balance || 0}
                        onChange={(e) => setFormData({ ...formData, balance: parseInt(e.target.value) })}
                        className="border-2 border-[#6BB4E8]"
                      />
                    </>
                  )}

                  {activeTab === "rooms" && (
                    <>
                      <Input
                        placeholder="Nome da Turma"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="border-2 border-[#6BB4E8]"
                      />
                      <Input
                        placeholder="Ano (ex: 8, 9, 1)"
                        value={formData.year || ""}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="border-2 border-[#6BB4E8]"
                      />
                    </>
                  )}

                  {(activeTab === "benefits" || activeTab === "activities") && (
                    <>
                      <div>
                        <Input
                          placeholder="Nome"
                          value={formData.name || ""}
                          onChange={(e) => {
                            const newName = e.target.value;
                            const shouldGenerate = !formData.image_url || formData.image_url === generateImageFromName(formData.name);
                            setFormData({ 
                              ...formData, 
                              name: newName,
                              image_url: shouldGenerate ? generateImageFromName(newName) : formData.image_url
                            });
                          }}
                          className="border-2 border-[#6BB4E8]"
                        />
                        <p className="text-xs text-[#4A90C8] mt-1">💡 Imagem auto-gerada (editável abaixo)</p>
                      </div>
                      <Input
                        placeholder="Descrição"
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="border-2 border-[#6BB4E8]"
                      />
                      <Input
                        type="number"
                        placeholder={activeTab === "benefits" ? "Custo" : "Recompensa"}
                        value={activeTab === "benefits" ? formData.cost || 0 : formData.reward || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [activeTab === "benefits" ? "cost" : "reward"]: parseInt(e.target.value),
                          })
                        }
                        className="border-2 border-[#6BB4E8]"
                      />
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="URL da Imagem (opcional - auto-gerada)"
                            value={formData.image_url || ""}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="border-2 border-[#6BB4E8] flex-1"
                          />
                          <Button
                            type="button"
                            onClick={() => setFormData({ ...formData, image_url: generateImageFromName(formData.name) })}
                            className="neo-button bg-green-600 hover:bg-green-700 text-white rounded-lg px-3"
                            title="Regerar imagem"
                          >
                            🔄
                          </Button>
                        </div>
                        {formData.image_url && formData.image_url.trim() !== "" && (
                          <div className="mt-3 border-2 border-[#6BB4E8] rounded-lg overflow-hidden bg-white">
                            <div className="text-xs font-semibold text-white bg-[#6BB4E8] p-2">
                              Preview da Imagem:
                            </div>
                            <div className="aspect-video bg-gray-100 relative">
                              <img
                                src={formData.image_url}
                                alt="Preview"
                                loading="lazy"
                                style={{ 
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover',
                                  objectPosition: 'center',
                                  display: 'block'
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/400x225/6BB4E8/FFFFFF?text=Gerando...';
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <Button onClick={handleSave} className="w-full neo-button bg-[#6BB4E8] hover:bg-[#6BB4E8] text-white rounded-lg">
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
