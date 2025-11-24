
import React, { useState } from 'react';

interface AdminProps {
  subscriptionPrice: number;
  onUpdatePrice: (price: number) => void;
}

const Admin: React.FC<AdminProps> = ({ subscriptionPrice, onUpdatePrice }) => {
  const [newPrice, setNewPrice] = useState<number>(subscriptionPrice);
  const [isSaved, setIsSaved] = useState(false);
  
  const formattedCurrentPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(subscriptionPrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(newPrice > 0){
        onUpdatePrice(newPrice);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg max-w-lg mx-auto">
        <h2 className="text-2xl font-semibold text-cyan-400 mb-6">Gestionar Suscripción</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Precio Mensual Actual</label>
            <p className="text-2xl font-bold text-white mt-1">{formattedCurrentPrice}</p>
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300">Nuevo Precio (ARS)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={newPrice}
              onChange={(e) => setNewPrice(Number(e.target.value))}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Ej: 17000"
            />
          </div>
          <div className="flex justify-end items-center pt-2">
            {isSaved && <span className="text-green-400 mr-4">¡Precio actualizado!</span>}
            <button type="submit" className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition">
              Guardar Precio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin;
