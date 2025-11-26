
import React from 'react';
import { UserProfile } from '../types';

interface SubscriptionProps {
  isSubscribed: boolean;
  userProfile: UserProfile;
  subscriptionPrice: number;
  paymentLink: string;
  adminPhone: string;
}

const Subscription: React.FC<SubscriptionProps> = ({ 
    isSubscribed, 
    userProfile,
    subscriptionPrice, 
    paymentLink,
    adminPhone
}) => {
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(subscriptionPrice);

  const handlePaymentClick = () => {
    if (paymentLink) {
        window.open(paymentLink, '_blank');
    } else {
        alert("El link de pago no ha sido configurado por el administrador aún.");
    }
  };

  const handleSendProof = () => {
      if (!adminPhone) {
          alert("El número de administración no está configurado.");
          return;
      }
      
      const text = `Hola! Envío comprobante de pago para Atlas 2.0 Gym.%0A%0A*Usuario:* ${userProfile.name}%0A*Teléfono:* ${userProfile.phone}`;
      // Clean phone number just in case
      const cleanPhone = adminPhone.replace(/[^0-9]/g, '');
      const waLink = `https://wa.me/${cleanPhone}?text=${text}`;
      window.open(waLink, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white">Suscripción</h1>
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg max-w-lg mx-auto text-center border border-gray-700">
        <h2 className="text-2xl font-semibold text-white">Estado de tu Plan</h2>
        <div className={`mt-4 text-lg font-bold py-2 px-6 rounded-full inline-block shadow-lg ${isSubscribed ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
          {isSubscribed ? 'ACTIVO' : 'VENCIDO'}
        </div>
        
        <p className="mt-6 text-gray-300">
          {isSubscribed 
            ? '¡Gracias por entrenar con nosotros! Tienes acceso completo a la app.' 
            : 'Tu suscripción ha expirado. Por favor realiza el pago para reactivar tu acceso.'}
        </p>

        <div className="mt-8 bg-gray-700/30 p-6 rounded-xl border border-gray-600">
            <h3 className="text-xl font-semibold text-cyan-400">Cuota Mensual</h3>
            <p className="text-5xl font-extrabold text-white mt-3 tracking-tight">{formattedPrice}</p>
            <ul className="text-gray-300 mt-6 space-y-3 text-left max-w-xs mx-auto text-sm">
                <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Acceso ilimitado a Rutinas</li>
                <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Plan Nutricional Personalizado</li>
                <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Soporte via Chat 24/7</li>
            </ul>
        </div>

        <div className="mt-8 space-y-4">
            <button 
                onClick={handlePaymentClick}
                className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black py-4 px-4 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-900/20 text-lg tracking-wide uppercase"
            >
                <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                PAGAR
            </button>
            
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink-0 mx-4 text-gray-500 text-xs uppercase">Una vez realizado el pago</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>

            <button
                onClick={handleSendProof}
                className="w-full flex items-center justify-center bg-gray-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-600 transition-all transform hover:scale-[1.02] border border-gray-600"
            >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-8.683-2.031-9.667-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                Enviar Comprobante
            </button>
        </div>
        
        {isSubscribed && (
            <div className="mt-8 text-sm text-gray-500">
                Tu plan está activo. Si deseas renovar por adelantado, usa el botón de PAGAR.
            </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;
