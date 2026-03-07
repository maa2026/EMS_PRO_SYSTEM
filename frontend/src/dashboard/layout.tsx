"use client";
import { useState } from "react";
import { LayoutGrid, Users, MapPin, ShieldCheck, Menu, X, ChevronRight, Home, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", icon: <LayoutGrid size={20}/>, path: "/dashboard" },
    { name: "Voter Intel", icon: <Users size={20}/>, path: "/dashboard/voter-intelligence" },
    { name: "Booth Master", icon: <Home size={20}/>, path: "/dashboard/booth-master" },
    { name: "Hierarchy", icon: <ShieldCheck size={20}/>, path: "/dashboard/hierarchy" },
  ];

  return (
    <div className="flex min-h-screen bg-[#000502] text-white">
      {/* --- SIDEBAR --- */}
      <aside className={`${isOpen ? 'w-64' : 'w-20'} transition-all border-r border-white/10 bg-[#000804] flex flex-col fixed h-full z-50`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          {isOpen && <b className="text-xl tracking-tighter italic">EMS<span className="text-[#DA251D]">PRO</span></b>}
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-white/5 rounded">
            <Menu size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div className={`flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer ${pathname === item.path ? 'bg-[#00914C]/20 text-[#00914C] border border-[#00914C]/30' : 'hover:bg-white/5 text-gray-400'}`}>
                {item.icon}
                {isOpen && <span className="text-sm font-bold">{item.name}</span>}
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className={`flex-1 transition-all ${isOpen ? 'ml-64' : 'ml-20'} p-8`}>
        <header className="flex justify-between items-center mb-10 border-b border-white/5 pb-5">
           <div>
             <h2 className="text-[10px] font-black text-[#DA251D] uppercase tracking-widest">Admin Control</h2>
             <h1 className="text-xl font-black uppercase">EMS UNIT V9.5</h1>
           </div>
           <div className="flex items-center gap-3 bg-[#00914C]/10 border border-[#00914C]/20 px-4 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-[#00914C] animate-pulse"></div>
              <span className="text-[10px] font-bold text-[#00914C]">SERVER SECURE</span>
           </div>
        </header>
        {children}
      </main>
    </div>
  );
}