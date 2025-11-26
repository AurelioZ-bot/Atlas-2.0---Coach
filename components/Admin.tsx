
import React, { useState, useEffect } from 'react';
import { RegisteredUser } from '../types';

interface AdminProps {
  subscriptionPrice: number;
  onUpdatePrice: (price: number) => void;
  paymentLink: string;
  onUpdatePaymentLink: (link: string) => void;
  adminPhone: string;
  onUpdateAdminPhone: (phone: string) => void;
}

// CONTRASEÑA DE ACCESO
const ADMIN_PASSWORD = "lauzur2011";

const Admin: React.FC<AdminProps> = ({ 
    subscriptionPrice, 
    onUpdatePrice, 
    paymentLink, 
    onUpdatePaymentLink,
    adminPhone,
    onUpdateAdminPhone
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  const [newPrice, setNewPrice] = useState<number>(subscriptionPrice);
  const [newPaymentLink, setNewPaymentLink] = useState<string>(paymentLink);
  const [newAdminPhone, setNewAdminPhone] = useState<string>(adminPhone);

  const [isSaved, setIsSaved] = useState(false);
  
  // User Management State
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const formattedCurrentPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(subscriptionPrice);

  useEffect(() => {
    if (isAuthenticated) {
        loadUsers();
    }
  }, [isAuthenticated]);

  const loadUsers = () => {
    try {
        const registryStr = localStorage.getItem('atlas2_userRegistry');
        if (registryStr) {
            setUsers(JSON.parse(registryStr));
        }
    } catch (e) {
        console.error("Error loading users", e);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
        setError('');
    } else {
        setError('Contraseña incorrecta');
        setPasswordInput('');
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    
    if(newPrice > 0) onUpdatePrice(newPrice);
    onUpdatePaymentLink(newPaymentLink);
    onUpdateAdminPhone(newAdminPhone);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const toggleUserStatus = (phone: string) => {
      const updatedUsers = users.map(user => {
          if (user.phone === phone) {
              return { ...user, isActive: !user.isActive };
          }
          return user;
      });
      setUsers(updatedUsers);
      localStorage.setItem('atlas2_userRegistry', JSON.stringify(updatedUsers));
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.phone.includes(searchTerm)
  );

  if (!isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fade-in">
             <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
                <div className="flex flex-col items-center mb-6">
                    <div className="p-3 bg-red-500/10 rounded-full mb-4">
                        <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Acceso Restringido</h2>
                    <p className="text-gray-400 text-center mt-2 text-sm">Esta área es exclusiva para la administración del gimnasio.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña de Administrador</label>
                        <input 
                            type="password" 
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center font-medium animate-pulse">{error}</p>}
                    <button 
                        type="submit" 
                        className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-[1.02] shadow-lg"
                    >
                        Desbloquear Panel
                    </button>
                </form>
             </div>
        </div>
      );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
        <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-sm text-gray-400 hover:text-white underline"
        >
            Bloquear Panel
        </button>
      </div>
      
      {/* Configuration Section */}
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-semibold text-cyan-400 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Configuración General
        </h2>
        <form onSubmit={handleSaveChanges} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Precio */}
             <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-300">Precio Suscripción (ARS)</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                    <input
                    type="number"
                    id="price"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="block w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                    placeholder="Ej: 17000"
                    />
                </div>
                <p className="text-xs text-gray-500">Actual: {formattedCurrentPrice}</p>
             </div>

             {/* WhatsApp Admin */}
             <div className="space-y-2">
                <label htmlFor="adminPhone" className="block text-sm font-medium text-gray-300">WhatsApp Admin (sin +)</label>
                <input
                    type="tel"
                    id="adminPhone"
                    value={newAdminPhone}
                    onChange={(e) => setNewAdminPhone(e.target.value)}
                    className="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                    placeholder="Ej: 5491112345678"
                />
                <p className="text-xs text-gray-500">Para recibir comprobantes.</p>
             </div>

             {/* Link de Pago */}
             <div className="col-span-1 md:col-span-2 space-y-2">
                <label htmlFor="paymentLink" className="block text-sm font-medium text-gray-300">Link de Pago (Mercado Pago / Otro)</label>
                <input
                    type="url"
                    id="paymentLink"
                    value={newPaymentLink}
                    onChange={(e) => setNewPaymentLink(e.target.value)}
                    className="block w-full bg-gray-700 border border-gray-600 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                    placeholder="https://mpago.la/..."
                />
             </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button type="submit" className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-900/20">
                Guardar Configuración
            </button>
          </div>
          {isSaved && (
             <p className="text-green-400 text-sm font-medium text-right animate-fade-in">¡Configuración guardada correctamente!</p>
          )}
        </form>
      </div>

      {/* Active Users Management Section */}
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
             <h2 className="text-2xl font-semibold text-cyan-400 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Gestión de Usuarios Activos
            </h2>
            <div className="relative w-full md:w-64">
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o teléfono..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 pl-10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                    <tr>
                        <th className="px-6 py-3 rounded-tl-lg">Nombre</th>
                        <th className="px-6 py-3">Teléfono</th>
                        <th className="px-6 py-3">Fecha Registro</th>
                        <th className="px-6 py-3 text-center">Cuota al Día</th>
                        <th className="px-6 py-3 rounded-tr-lg text-right">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                            <tr key={user.phone} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                                <td className="px-6 py-4">{user.phone}</td>
                                <td className="px-6 py-4 text-sm">{new Date(user.registrationDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {user.isActive ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => toggleUserStatus(user.phone)}
                                        className={`text-sm font-semibold px-3 py-1.5 rounded border transition-colors ${
                                            user.isActive 
                                            ? 'border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white' 
                                            : 'border-green-500/50 text-green-400 hover:bg-green-500 hover:text-white'
                                        }`}
                                    >
                                        {user.isActive ? 'Bloquear' : 'Habilitar'}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                No se encontraron usuarios registrados.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
