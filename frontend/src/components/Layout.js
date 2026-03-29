import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import { Lock } from "@phosphor-icons/react";
import AdminModal from "@/components/AdminModal";

export default function Layout() {
  const [showAdminModal, setShowAdminModal] = useState(false);

  return (
    <div className="min-h-screen relative" style={{ zIndex: 2 }}>
      <nav className="bg-white border-b-2 border-[#6BB4E8] shadow-[0_4px_0_#6BB4E8] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tighter" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                <span className="text-[#6BB4E8]">GAMA</span>
                <span className="text-[#4A90C8]">BANK</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <NavLink
                to="/"
                data-testid="nav-home"
                className={({ isActive }) =>
                  `px-5 py-2 rounded-full font-semibold transition-all border-2 border-[#6BB4E8] ${
                    isActive
                      ? 'bg-[#6BB4E8] text-white shadow-[2px_2px_0_#4A90C8]'
                      : 'bg-white text-[#4A90C8] shadow-[2px_2px_0_#6BB4E8] hover:shadow-[3px_3px_0_#6BB4E8] hover:-translate-y-0.5'
                  }`
                }
              >
                Início
              </NavLink>
              
              <NavLink
                to="/benefits"
                data-testid="nav-benefits"
                className={({ isActive }) =>
                  `px-5 py-2 rounded-full font-semibold transition-all border-2 border-[#6BB4E8] ${
                    isActive
                      ? 'bg-[#6BB4E8] text-white shadow-[2px_2px_0_#4A90C8]'
                      : 'bg-white text-[#4A90C8] shadow-[2px_2px_0_#6BB4E8] hover:shadow-[3px_3px_0_#6BB4E8] hover:-translate-y-0.5'
                  }`
                }
              >
                Benefícios
              </NavLink>
              
              <NavLink
                to="/activities"
                data-testid="nav-activities"
                className={({ isActive }) =>
                  `px-5 py-2 rounded-full font-semibold transition-all border-2 border-[#6BB4E8] ${
                    isActive
                      ? 'bg-[#6BB4E8] text-white shadow-[2px_2px_0_#4A90C8]'
                      : 'bg-white text-[#4A90C8] shadow-[2px_2px_0_#6BB4E8] hover:shadow-[3px_3px_0_#6BB4E8] hover:-translate-y-0.5'
                  }`
                }
              >
                Como Ganhar
              </NavLink>
              
              <NavLink
                to="/classes"
                data-testid="nav-classes"
                className={({ isActive }) =>
                  `px-5 py-2 rounded-full font-semibold transition-all border-2 border-[#6BB4E8] ${
                    isActive
                      ? 'bg-[#6BB4E8] text-white shadow-[2px_2px_0_#4A90C8]'
                      : 'bg-white text-[#4A90C8] shadow-[2px_2px_0_#6BB4E8] hover:shadow-[3px_3px_0_#6BB4E8] hover:-translate-y-0.5'
                  }`
                }
              >
                Turmas
              </NavLink>
              
              <button
                onClick={() => setShowAdminModal(true)}
                data-testid="admin-button"
                className="ml-4 p-2.5 rounded-full bg-[#6BB4E8] text-white border-2 border-[#4A90C8] shadow-[2px_2px_0_#4A90C8] hover:shadow-[3px_3px_0_#4A90C8] hover:-translate-y-0.5 transition-all"
                title="Acesso Admin"
              >
                <Lock size={20} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="relative" style={{ zIndex: 2 }}>
        <Outlet />
      </main>
      
      <AdminModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />
    </div>
  );
}