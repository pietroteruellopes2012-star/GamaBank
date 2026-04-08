import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function StudentLoginModal({ isOpen, onClose }) {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) loadClasses();
  }, [isOpen]);

  useEffect(() => {
    if (selectedClass) loadStudents();
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const res = await axios.get(`${API}/classes`);
      setClasses(res.data);
    } catch (error) {
      toast.error("Erro ao carregar turmas");
    }
  };

  const loadStudents = async () => {
    try {
      const res = await axios.get(`${API}/students/class/${selectedClass}`);
      setStudents(res.data);
    } catch (error) {
      toast.error("Erro ao carregar alunos");
    }
  };

  const handleLogin = async () => {
    if (!selectedStudent || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
    try {
      const res = await axios.post(`${API}/student/login`, {
        student_id: selectedStudent,
        password: password,
      });
      if (res.data.success) {
        localStorage.setItem("student", JSON.stringify(res.data.student));
        toast.success("Login realizado!");
        onClose();
        navigate(`/student/${selectedStudent}`);
      }
    } catch (error) {
      toast.error("Senha incorreta!");
      setPassword("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-modal sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter" style={{ fontFamily: 'Unbounded, sans-serif', color: '#6BB4E8' }}>
            Login do Aluno
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[#4A90C8] font-semibold mb-2 block">Selecione sua turma</label>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(""); }}
              className="w-full p-2 border-2 border-[#6BB4E8] rounded-lg"
            >
              <option value="">Escolha a turma</option>
              {classes.map((c) => (
                <option key={c.id} value={c.year}>{c.name}</option>
              ))}
            </select>
          </div>

          {selectedClass && (
            <div>
              <label className="text-sm text-[#4A90C8] font-semibold mb-2 block">Selecione seu nome</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full p-2 border-2 border-[#6BB4E8] rounded-lg"
              >
                <option value="">Escolha seu nome</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {selectedStudent && (
            <div>
              <label className="text-sm text-[#4A90C8] font-semibold mb-2 block">Digite sua senha</label>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                className="border-2 border-[#6BB4E8] shadow-[2px_2px_0_#6BB4E8] focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={!selectedStudent || !password}
            className="w-full neo-button bg-[#6BB4E8] hover:bg-[#6BB4E8] text-white rounded-lg"
          >
            Entrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
