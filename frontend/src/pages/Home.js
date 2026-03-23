import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins, TrendUp, Users } from "@phosphor-icons/react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Home() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await axios.get(`${API}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalGamas = students.reduce((sum, student) => sum + student.balance, 0);
  const avgGamas = students.length > 0 ? Math.round(totalGamas / students.length) : 0;
  const topStudent = students.length > 0 ? students.reduce((max, student) => student.balance > max.balance ? student : max, students[0]) : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-4" style={{ fontFamily: 'Unbounded, sans-serif' }}>
            Sistema de <span className="text-[#FF5C00]">GAMAS</span>
          </h1>
          <p className="text-lg md:text-xl text-[#4B5563] max-w-2xl mx-auto">
            Ganhe gamas realizando atividades e troque por benefícios incríveis!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="neo-card p-8"
            data-testid="total-gamas-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#4B5563] font-semibold mb-2">Total de Gamas</p>
                <p className="text-5xl font-black gama-number" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                  {totalGamas}
                </p>
              </div>
              <div className="p-3 bg-[#D8EAF5] rounded-lg border-2 border-[#0A0A0A]">
                <Coins size={32} weight="bold" className="text-[#FF5C00]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="neo-card p-8"
            data-testid="avg-gamas-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#4B5563] font-semibold mb-2">Média de Gamas</p>
                <p className="text-5xl font-black gama-number" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                  {avgGamas}
                </p>
              </div>
              <div className="p-3 bg-[#D8EAF5] rounded-lg border-2 border-[#0A0A0A]">
                <TrendUp size={32} weight="bold" className="text-[#FF5C00]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="neo-card p-8"
            data-testid="total-students-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#4B5563] font-semibold mb-2">Total de Alunos</p>
                <p className="text-5xl font-black gama-number" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                  {students.length}
                </p>
              </div>
              <div className="p-3 bg-[#D8EAF5] rounded-lg border-2 border-[#0A0A0A]">
                <Users size={32} weight="bold" className="text-[#FF5C00]" />
              </div>
            </div>
          </motion.div>
        </div>

        {topStudent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="neo-card p-8 mb-12"
            data-testid="top-student-card"
          >
            <div className="text-center">
              <p className="text-[#4B5563] font-semibold mb-3">🏆 Aluno Destaque</p>
              <h2 className="text-4xl font-black tracking-tighter mb-2" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                {topStudent.name}
              </h2>
              <p className="text-6xl font-black gama-number" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                {topStudent.balance} GAMAS
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="neo-card p-8"
          >
            <h3 className="text-2xl font-black tracking-tighter mb-4" style={{ fontFamily: 'Unbounded, sans-serif' }}>
              Como Funciona?
            </h3>
            <ul className="space-y-3 text-[#4B5563]">
              <li className="flex items-start gap-3">
                <span className="text-[#FF5C00] font-bold text-xl">1.</span>
                <span>Realize atividades e participe das aulas para ganhar gamas</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF5C00] font-bold text-xl">2.</span>
                <span>Acumule seus gamas no seu saldo pessoal</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF5C00] font-bold text-xl">3.</span>
                <span>Troque seus gamas por benefícios exclusivos</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="neo-card p-8 bg-[#FF5C00] text-white border-[#0A0A0A]"
          >
            <h3 className="text-2xl font-black tracking-tighter mb-4" style={{ fontFamily: 'Unbounded, sans-serif' }}>
              Dicas para Ganhar Mais!
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="font-bold text-xl">•</span>
                <span>Participe ativamente de todas as aulas</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-xl">•</span>
                <span>Ajude seus colegas com dúvidas</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-xl">•</span>
                <span>Entregue trabalhos sempre no prazo</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}