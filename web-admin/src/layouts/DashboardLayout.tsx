import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import FontSizeControl from '../components/FontSizeControl';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  UsersRound, 
  FileText, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const adminLinks = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/professores', icon: GraduationCap, label: 'Professores' },
    { path: '/admin/alunos', icon: Users, label: 'Alunos' },
    { path: '/admin/turmas', icon: UsersRound, label: 'Turmas' },
    { path: '/questionarios', icon: FileText, label: 'Questionários' }
  ];

  const profLinks = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/questionarios', icon: FileText, label: 'Questionários' }
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : profLinks;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="ml-2 sm:ml-4 lg:ml-0 text-lg sm:text-xl font-bold text-primary-600 truncate">
                Forms Tech
              </h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden md:block">
                <FontSizeControl />
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">{user?.nome}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'ADMIN' ? 'Administrador' : 'Professor'}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`
            fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
            transform transition-transform duration-200 ease-in-out lg:h-auto
            overflow-y-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="p-4 space-y-2 mt-16 lg:mt-4">
            {/* Controle de fonte para mobile */}
            <div className="md:hidden mb-4 pb-4 border-b border-gray-200">
              <FontSizeControl />
            </div>
            
            {links.map((link) => {
              const Icon = link.icon;
              const active = link.path === '/' 
                ? location.pathname === '/' 
                : isActive(link.path);
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${active 
                      ? 'bg-primary-50 text-primary-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

