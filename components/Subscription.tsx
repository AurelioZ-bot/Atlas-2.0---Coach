
import React from 'react';

interface SubscriptionProps {
  isSubscribed: boolean;
  setIsSubscribed: (status: boolean) => void;
  subscriptionPrice: number;
}

const Subscription: React.FC<SubscriptionProps> = ({ isSubscribed, setIsSubscribed, subscriptionPrice }) => {
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(subscriptionPrice);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white">Suscripción</h1>
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg max-w-lg mx-auto text-center">
        <h2 className="text-2xl font-semibold text-white">Estado de tu Plan</h2>
        <div className={`mt-4 text-lg font-bold py-2 px-4 rounded-full inline-block ${isSubscribed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {isSubscribed ? 'Activa' : 'Vencida'}
        </div>
        
        <p className="mt-6 text-gray-300">
          {isSubscribed 
            ? '¡Gracias por ser parte de Atlas 2.0! Tu acceso a todas las funcionalidades está activo.' 
            : 'Tu suscripción ha vencido. Reactívala para acceder al coach virtual y recibir nuevos planes.'}
        </p>

        <div className="mt-8">
            <h3 className="text-xl font-semibold text-cyan-400">Plan Atlas Pro</h3>
            <p className="text-4xl font-bold text-white mt-2">{formattedPrice} <span className="text-lg font-normal text-gray-400">/ mes</span></p>
            <ul className="text-gray-300 mt-4 space-y-2">
                <li>✓ Planes de entrenamiento ilimitados</li>
                <li>✓ Planes de nutrición personalizados</li>
                <li>✓ Acceso 24/7 al Coach Virtual</li>
                <li>✓ Seguimiento de progreso avanzado</li>
            </ul>
        </div>

        <div className="mt-8">
          {!isSubscribed && (
            <a 
              href="https://www.mercadopago.com.ar/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full block bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Pagar con Mercado Pago
            </a>
          )}
           <button
                onClick={() => setIsSubscribed(!isSubscribed)}
                className="w-full mt-4 bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
                {isSubscribed ? 'Simular cancelación' : 'Simular pago exitoso'}
            </button>
            <p className="text-xs text-gray-500 mt-2">(Botón de simulación para fines de demostración)</p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
