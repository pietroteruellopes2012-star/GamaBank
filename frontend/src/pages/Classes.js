import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Coins, Users } from "@phosphor-icons/react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const classNames = {
  "8": "8º Ano",
  "9": "9º Ano",
  "1": "1º Colegial"
};

export default function Classes() {
  const [selectedClass, setSelectedClass] = useState("8");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadStudents();
      }
    };
    
    window.addEventListener('focus', loadStudents);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', loadStudents);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedClass]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/students/class/${selectedClass}`);
      setStudents(response.data.sort((a, b) => b.balance - a.balance));
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4" style={{ fontFamily: 'Unbounded, sans-serif' }}>
            <span className="text-[#6BB4E8]">Turmas</span>
          </h1>
          <p className="text-lg md:text-xl text-[#4B5563] max-w-2xl mx-auto">
            Confira o ranking de gamas por turma
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-12">
          {Object.entries(classNames).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setSelectedClass(key)}
              data-testid={`class-tab-${key}`}
              className={`px-6 py-3 rounded-full font-bold text-lg transition-all border-2 border-[#6BB4E8] ${
                selectedClass === key
                  ? 'bg-[#6BB4E8] text-white shadow-[3px_3px_0_#6BB4E8]'
                  : 'bg-white text-[#6BB4E8] shadow-[2px_2px_0_#6BB4E8] hover:shadow-[3px_3px_0_#6BB4E8] hover:-translate-y-0.5'
              }`}
              style={{ fontFamily: 'Unbounded, sans-serif' }}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="neo-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users size={32} weight="bold" className="text-[#6BB4E8]" />
            <h2 className="text-3xl font-black tracking-tighter" style={{ fontFamily: 'Unbounded, sans-serif' }}>
              {classNames[selectedClass]}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-[#4B5563]">Carregando alunos...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/student/${student.id}`)}
                  data-testid={`student-item-${index}`}
                  className="flex items-center justify-between p-4 bg-white border-2 border-[#6BB4E8] rounded-lg shadow-[2px_2px_0_#6BB4E8] hover:shadow-[4px_4px_0_#6BB4E8] hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-[#D8EAF5] border-2 border-[#6BB4E8] rounded-full font-black" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold">{student.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins size={24} weight="bold" className="text-[#6BB4E8]" />
                    <span className="text-3xl font-black gama-number" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                      {student.balance}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}