import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Coins, Plus, Minus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const classNames = {
  "8": "8º Ano",
  "9": "9º Ano",
  "1": "1º Colegial"
};

export default function StudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(adminStatus);
  }, []);

  const loadStudent = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/students/${studentId}`);
      setStudent(response.data);
    } catch (error) {
      console.error("Erro ao carregar aluno:", error);
      toast.error("Erro ao carregar dados do aluno");
    } finally {
      setLoading(false);
    }
  };

  const handleGamaOperation = async (operation) => {
    if (!amount || parseInt(amount) <= 0) {
      toast.error("Digite um valor válido");
      return;
    }
    if (!description.trim()) {
      toast.error("Digite uma descrição");
      return;
    }

    setProcessing(true);
    try {
      await axios.post(`${API}/admin/students/${studentId}/gamas`, {
        amount: parseInt(amount),
        description: description.trim(),
        operation: operation
      });
      
      toast.success(operation === "add" ? "Gamas adicionados!" : "Gamas removidos!");
      setAmount("");
      setDescription("");
      loadStudent();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erro ao processar operação");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-center text-[#4B5563]">Carregando...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-center text-[#4B5563]">Aluno não encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate("/classes")}
          data-testid="back-button"
          className="flex items-center gap-2 mb-8 text-[#4B5563] hover:text-[#6BB4E8] transition-colors font-semibold"
        >
          <ArrowLeft size={20} weight="bold" />
          Voltar para Turmas
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 neo-card p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                  {student.name}
                </h1>
                <p className="text-lg text-[#4B5563] font-semibold">
                  {classNames[student.class_year]}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#4B5563] mb-1">Saldo Atual</p>
                <div className="flex items-center gap-2">
                  <Coins size={32} weight="bold" className="text-[#6BB4E8]" />
                  <span className="text-5xl font-black gama-number" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                    {student.balance}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="neo-card p-6 bg-[#6BB4E8] border-[#6BB4E8]" data-testid="admin-panel">
              <h3 className="text-xl font-black tracking-tighter mb-4 text-white" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                Painel Admin
              </h3>
              <div className="space-y-3">
                <Input
                  type="number"
                  placeholder="Quantidade"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="gama-amount-input"
                  className="bg-white border-2 border-[#6BB4E8] shadow-[2px_2px_0_#6BB4E8] focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Input
                  type="text"
                  placeholder="Descrição"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  data-testid="gama-description-input"
                  className="bg-white border-2 border-[#6BB4E8] shadow-[2px_2px_0_#6BB4E8] focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleGamaOperation("add")}
                    disabled={processing}
                    data-testid="add-gamas-button"
                    className="neo-button bg-[#6BB4E8] hover:bg-[#6BB4E8] text-white rounded-lg flex items-center gap-2"
                  >
                    <Plus size={18} weight="bold" />
                    Adicionar
                  </Button>
                  <Button
                    onClick={() => handleGamaOperation("subtract")}
                    disabled={processing}
                    data-testid="subtract-gamas-button"
                    className="neo-button bg-white hover:bg-white text-[#6BB4E8] rounded-lg flex items-center gap-2"
                  >
                    <Minus size={18} weight="bold" />
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="neo-card p-8">
          <h2 className="text-3xl font-black tracking-tighter mb-6" style={{ fontFamily: 'Unbounded, sans-serif' }}>
            Extrato de Transações
          </h2>
          
          {student.transactions && student.transactions.length > 0 ? (
            <div className="space-y-3">
              {student.transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  data-testid={`transaction-${index}`}
                  className="flex items-center justify-between p-4 bg-[#D8EAF5] border-2 border-[#6BB4E8] rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-[#6BB4E8]">{transaction.description}</p>
                    <p className="text-sm text-[#4B5563]">
                      {new Date(transaction.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className={`text-2xl font-black ${transaction.type === 'add' ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: 'Unbounded, sans-serif' }}>
                    {transaction.type === 'add' ? '+' : '-'}{transaction.amount}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#4B5563] py-8">Nenhuma transação registrada</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
