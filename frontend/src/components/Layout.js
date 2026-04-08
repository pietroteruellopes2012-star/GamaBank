import { Outlet, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { Lock, List, X, User } from "@phosphor-icons/react";
import AdminModal from "@/components/AdminModal";
import StudentLoginModal from "@/components/StudentLoginModal";

export default function Layout() {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("student");
  }, []);

  return (
    <div className="min-h-screen relative" style={{ zIndex: 2 }}>
      <nav className="bg-white border-b-2 border-[#6BB4E8] shadow-[0_4px_0_#6BB4E8] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter" style={{ fontFamily: 'Unbounded, sans-serif' }}>
              <span className="text-[#6BB4E8]">GAMA</span>
              <span className="text-[#4A90C8]">BANK</span>
            </h1>
            
            <div className="hidden md:flex items-center gap-2">
              <NavLink to="/" data-testid="nav-home" className={({ isActive }) => `px-5 py-2 rounded-full font-semibold transition-all border-2 border-[#6BB4E8] ${isActive ? 'bg-[#6BB4E8] text-white shadow-[2px_2px_0_#4A90C8]' : 'bg-white text-[#4A90C8] shadow-[2px_2px_0_#6BB4E8] hover:shadow-[3px_3px_0_#6BB4E8] hover:-translate-y-0.5'}`}>Início</NavLink>
              <NavLink to="/benefits" data-testid="nav-benefits" className={({ isActive }) => `px-5 py-2 rounded-full font-semibold transition-all border-2 border-[#6BB4E8] ${isActive ? 'bg-[#6BB4E8] text-white shadow-[2px_2px_0_#4A90C8]' : 'bg-white text-[#4A90C8] shadow-[2px_2px_0_#6BB4E8] hover:shadow-[3px_3px_0_#6BB4E8] hover:-translate-y-0.5'}`}>Benefícios</NavLink>
              <NavLink to="/activities" data-testid="nav-activities" className={({ isActive }) => `px-5 py-2 rounded-full font-semibold transition-all border-2 border-[#6BB4E8] ${isActive ? 'bg-[#6BB4E8] text-white shadow-[2px_2px_0_#4A90C8]' : 'bg-white text-[#4A90C8] shadow-[2px_2px_0_#6BB4E8] hover:shadow-[3px_3px_0_#6BB4E8] hover:-translate-y-0.5'}`}>Como Ganhar</NavLink>
              <NavLink to="/classes" data-testid="nav-classes" className={({ isActive }) => `px-5 py-2 rounded-full font-semibold transition-all border-2 border-[#6BB4E8] ${isActive ? 'bg-[#6BB4E8] text-white shadow-[2px_2px_0_#4A90C8]' : 'bg-white text-[#4A90C8] shadow-[2px_2px_0_#6BB4E8] hover:shadow-[3px_3px_0_#6BB4E8] hover:-translate-y-0.5'}`}>Turmas</NavLink>
              <button onClick={() => setShowStudentModal(true)} className="p-2.5 rounded-full bg-green-500 text-white border-2 border-green-600 shadow-[2px_2px_0_rgba(22,163,74,0.5)] hover:shadow-[3px_3px_0_rgba(22,163,74,0.5)] hover:-translate-y-0.5 transition-all" title="Login Aluno"><User size={20} weight="bold" /></button>
              <button onClick={() => setShowAdminModal(true)} data-testid="admin-button" className="p-2.5 rounded-full bg-[#6BB4E8] text-white border-2 border-[#4A90C8] shadow-[2px_2px_0_#4A90C8] hover:shadow-[3px_3px_0_#4A90C8] hover:-translate-y-0.5 transition-all" title="Acesso Admin"><Lock size={20} weight="bold" /></button>
            </div>

            <div className="flex md:hidden gap-2">
              <button onClick={() => setShowStudentModal(true)} className="p-2 rounded-full bg-green-500 text-white border-2 border-green-600"><User size={20} weight="bold" /></button>
              <button onClick={() => setShowAdminModal(true)} className="p-2 rounded-full bg-[#6BB4E8] text-white border-2 border-[#4A90C8]"><Lock size={20} weight="bold" /></button>
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 rounded-full bg-[#6BB4E8] text-white border-2 border-[#4A90C8]">{showMobileMenu ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}</button>
            </div>
          </div>

          {showMobileMenu && (
            <div className="md:hidden mt-4 space-y-2">
              <NavLink to="/" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `block px-4 py-2 rounded-lg font-semibold border-2 border-[#6BB4E8] ${isActive ? 'bg-[#6BB4E8] text-white' : 'bg-white text-[#4A90C8]'}`}>Início</NavLink>
              <NavLink to="/benefits" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `block px-4 py-2 rounded-lg font-semibold border-2 border-[#6BB4E8] ${isActive ? 'bg-[#6BB4E8] text-white' : 'bg-white text-[#4A90C8]'}`}>Benefícios</NavLink>
              <NavLink to="/activities" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `block px-4 py-2 rounded-lg font-semibold border-2 border-[#6BB4E8] ${isActive ? 'bg-[#6BB4E8] text-white' : 'bg-white text-[#4A90C8]'}`}>Como Ganhar</NavLink>
              <NavLink to="/classes" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `block px-4 py-2 rounded-lg font-semibold border-2 border-[#6BB4E8] ${isActive ? 'bg-[#6BB4E8] text-white' : 'bg-white text-[#4A90C8]'}`}>Turmas</NavLink>
            </div>
          )}
        </div>
      </nav>
      
      <main className="relative" style={{ zIndex: 2 }}>
        <Outlet />
      </main>
      
      <AdminModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />
      <StudentLoginModal isOpen={showStudentModal} onClose={() => setShowStudentModal(false)} />
    </div>
  );
}