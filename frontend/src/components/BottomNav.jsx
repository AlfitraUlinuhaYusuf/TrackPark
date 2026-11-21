import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bike, Layers, Plus, History, Info } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    {
      to: '/vehicles',
      label: 'Parkir',
      icon: Bike,
    },
    {
      to: '/zones',
      label: 'Zona',
      icon: Layers,
    },
    {
      to: '/add',
      label: 'Catat',
      icon: Plus,
      isSpecial: true,
    },
    {
      to: '/history',
      label: 'Riwayat',
      icon: History,
    },
    {
      to: '/about',
      label: 'Tentang',
      icon: Info,
    },
  ];

  return (
    // Sembunyikan otomatis di Desktop (md:hidden), aktif di Mobile
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-3 py-2 flex items-center justify-around shadow-2xl pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isSpecial) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center -mt-6 group focus:outline-none`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`w-13 h-13 p-3 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-blue-500/40 ring-4 ring-blue-100'
                          : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/30 hover:scale-105'
                      }`}
                    >
                      <Icon className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <span
                      className={`text-[10px] font-medium mt-1 transition ${
                        isActive ? 'text-blue-600 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-400 hover:text-slate-600 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1 rounded-lg transition ${
                      isActive ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <span className="text-[10px] tracking-tight">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
