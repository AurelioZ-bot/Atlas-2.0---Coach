import React, { useState, useEffect } from 'react';
import { NutritionPlan } from '../types';

interface NutritionProps {
  nutritionPlan: NutritionPlan | null;
}

const Nutrition: React.FC<NutritionProps> = ({ nutritionPlan }) => {
  const [activeDay, setActiveDay] = useState<string | null>(null);

  useEffect(() => {
    // When the nutrition plan loads or changes, set the active day to the first day.
    if (nutritionPlan?.dailyPlan?.length) {
      setActiveDay(nutritionPlan.dailyPlan[0].day);
    }
  }, [nutritionPlan]);

  if (!nutritionPlan || !nutritionPlan.dailyPlan || nutritionPlan.dailyPlan.length === 0) {
    return (
      <div className="text-center bg-gray-800 p-8 rounded-2xl animate-fade-in">
        <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Plan de Nutrición no disponible</h2>
        <p className="text-gray-300">
          Parece que tu plan de nutrición no se pudo generar correctamente en este momento.
        </p>
        <p className="text-gray-400 mt-2">
          Puedes intentar <span className="font-semibold text-cyan-400">actualizar tu perfil</span> o pedirle al <span className="font-semibold text-cyan-400">coach virtual</span> que genere un nuevo plan para ti.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white">{nutritionPlan.title}</h1>
      <p className="text-gray-300">{nutritionPlan.description}</p>
      
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {nutritionPlan.dailyPlan.map(plan => (
          <button 
            key={plan.day} 
            onClick={() => setActiveDay(plan.day)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${activeDay === plan.day ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            {plan.day}
          </button>
        ))}
      </div>

      <div>
        {nutritionPlan.dailyPlan.filter(p => p.day === activeDay).map(plan => (
          <div key={plan.day} className="bg-gray-800 p-6 rounded-2xl shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-gray-700">
                 <h2 className="text-2xl font-bold text-white">Plan para el {plan.day}</h2>
                 {plan.focus && (
                    <span className={`px-4 py-1 text-sm font-semibold rounded-full whitespace-nowrap ${
                        plan.focus.includes('Entrenamiento') 
                        ? 'bg-cyan-600 text-white' 
                        : 'bg-yellow-500 text-gray-900'
                    }`}>
                        {plan.focus}
                    </span>
                 )}
            </div>

            <div className="text-center bg-gray-700 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-cyan-400">Resumen Nutricional Diario</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-white">
                    <div>
                        <p className="text-sm text-gray-400">Calorías</p>
                        <p className="font-semibold">{plan.dailyTotals?.calories || 'N/A'}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-400">Proteínas</p>
                        <p className="font-semibold">{plan.dailyTotals?.protein || 'N/A'}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-400">Carbs</p>
                        <p className="font-semibold">{plan.dailyTotals?.carbs || 'N/A'}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-400">Grasas</p>
                        <p className="font-semibold">{plan.dailyTotals?.fats || 'N/A'}</p>
                    </div>
                </div>
            </div>
            
            <div className="space-y-4">
              {plan.meals.map((meal, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg text-cyan-400 mb-2">{meal.name}</h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {meal.foods.map((food, i) => <li key={i}>{food}</li>)}
                  </ul>
                  {meal.macros && (
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-600 text-center">
                        <div>
                            <p className="text-xs text-gray-400">Proteína</p>
                            <p className="text-sm font-medium text-white">{meal.macros.protein}</p>
                        </div>
                         <div>
                            <p className="text-xs text-gray-400">Carbs</p>
                            <p className="text-sm font-medium text-white">{meal.macros.carbs}</p>
                        </div>
                         <div>
                            <p className="text-xs text-gray-400">Grasa</p>
                            <p className="text-sm font-medium text-white">{meal.macros.fats}</p>
                        </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Nutrition;