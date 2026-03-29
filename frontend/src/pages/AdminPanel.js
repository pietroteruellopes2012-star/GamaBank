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
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      toast.error("Acesso negado!");
      navigate("/");
      return;
    }
    loadData();
  }, [activeTab]);

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
      }
    } catch (error) {
      toast.error("Erro ao carregar dados");
    }
  };

  const handleSave = async () => {
    try {
      if (editing?.id) {
        await axios.put(`${API}/admin/${activeTab}/${editing.id}`, formData);
        toast.success("Atualizado!");
      } else {
        await axios.post(`${API}/admin/${activeTab}`, formData);
        toast.success("Criado!");
      }
      setEditing(null);
      setFormData({});
      loadData();
    } catch (error) {
      toast.error("Erro ao salvar");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Confirma exclusão?")) return;
    try {
      await axios.delete(`${API}/admin/${activeTab}/${id}`);
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
    setFormData(
      activeTab === "students"
        ? { name: "", class_year: "8", balance: 0 }
        : activeTab === "benefits"
        ? { name: "", description: "", cost: 0, image_url: "" }
        : { name: "", description: "", reward: 0, image_url: "" }
    );
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black mb-8" style={{ fontFamily: "Unbounded, sans-serif", color: "#6BB4E8" }}>
            Painel Administrativo
          </h1>

          <div className="flex gap-2 mb-6">
            {["students", "benefits", "activities"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full font-bold border-2 border-[#6BB4E8] transition-all ${
                  activeTab === tab
                    ? "bg-[#6BB4E8] text-white shadow-[3px_3px_0_#4A90C8]"
                    : "bg-white text-[#4A90C8] shadow-[2px_2px_0_#6BB4E8]"
                }`}
              >
                {tab === "students" ? "Alunos" : tab === "benefits" ? "Benefícios" : "Atividades"}
              </button>
            ))}
          </div>

          <div className="neo-card p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold" style={{ color: "#6BB4E8" }}>
                {activeTab === "students" ? "Alunos" : activeTab === "benefits" ? "Benefícios" : "Atividades"}
              </h2>
              <Button onClick={startNew} className="neo-button bg-[#6BB4E8] hover:bg-[#6BB4E8] text-white rounded-lg">
                <Plus size={20} weight="bold" /> Adicionar
              </Button>
            </div>

            {activeTab === "students" && (
              <div className="space-y-2">
                {students.map((s) => (
                  <div key={s.id} className="flex justify-between items-center p-4 bg-[#E8F4FA] rounded-lg border-2 border-[#6BB4E8]">
                    <div>
                      <p className="font-bold text-[#4A90C8]">{s.name}</p>
                      <p className="text-sm text-[#4A90C8]">
                        {s.class_year === "8" ? "8º Ano" : s.class_year === "9" ? "9º Ano" : "1º Colegial"} - {s.balance} gamas
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
                  {activeTab === "students" && (
                    <>
                      <Input
                        placeholder="Nome"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="border-2 border-[#6BB4E8]"
                      />
                      <select
                        value={formData.class_year || "8"}
                        onChange={(e) => setFormData({ ...formData, class_year: e.target.value })}
                        className="w-full p-2 border-2 border-[#6BB4E8] rounded-lg"
                      >
                        <option value="8">8º Ano</option>
                        <option value="9">9º Ano</option>
                        <option value="1">1º Colegial</option>
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

                  {(activeTab === "benefits" || activeTab === "activities") && (
                    <>
                      <Input
                        placeholder="Nome"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="border-2 border-[#6BB4E8]"
                      />
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
                      <Input
                        placeholder="URL da Imagem"
                        value={formData.image_url || ""}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="border-2 border-[#6BB4E8]"
                      />
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
