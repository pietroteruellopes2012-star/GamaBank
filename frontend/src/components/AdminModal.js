import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminModal({ isOpen, onClose }) {
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(adminStatus);
  }, [isOpen]);

  const handleVerify = async () => {
    try {
      const response = await axios.post(`${API}/admin/verify`, { password });
      if (response.data.success) {
        localStorage.setItem("isAdmin", "true");
        setIsAdmin(true);
        toast.success("Acesso admin concedido!");
        setPassword("");
        onClose();
        navigate("/admin");
      }
    } catch (error) {
      toast.error("Senha incorreta!");
      setPassword("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    setIsAdmin(false);
    toast.info("Modo admin desativado");
    onClose();
    window.location.href = "/";
  };

  const goToPanel = () => {
    onClose();
    navigate("/admin");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-modal sm:max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter" style={{ fontFamily: 'Unbounded, sans-serif' }}>
            {isAdmin ? "Modo Admin Ativo" : "Acesso Admin"}
          </DialogTitle>
        </DialogHeader>
        
        {!isAdmin ? (
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleVerify()}
              data-testid="admin-password-input"
              className="border-2 border-[#6BB4E8] shadow-[2px_2px_0_#6BB4E8] focus:shadow-[3px_3px_0_#6BB4E8] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              onClick={handleVerify}
              data-testid="admin-verify-button"
              className="w-full neo-button bg-[#6BB4E8] hover:bg-[#6BB4E8] text-white rounded-lg"
            >
              Entrar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-[#4A90C8]">Você está no modo administrador</p>
            <Button
              onClick={goToPanel}
              className="w-full neo-button bg-[#6BB4E8] hover:bg-[#6BB4E8] text-white rounded-lg"
            >
              Ir para Painel Admin
            </Button>
            <Button
              onClick={handleLogout}
              data-testid="admin-logout-button"
              className="w-full neo-button bg-[#4A90C8] hover:bg-[#4A90C8] text-white rounded-lg"
            >
              Sair do Modo Admin
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}