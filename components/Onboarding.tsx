
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { EXPERIENCE_LEVELS, GOALS, ROUTINE_TYPES } from '../constants';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    sex: 'male',
    age: 0,
    weight: 0,
    height: 0,
    experience: 'beginner',
    availability: 3,
    goal: GOALS[0],
    routineType: ROUTINE_TYPES[0],
    injuries: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: name === 'age' || name === 'weight' || name === 'height' || name === 'availability' ? Number(value) : value }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-cyan-400">Bienvenido a Atlas 2.0</h1>
            <p className="text-gray-300 mt-2">Completa tu perfil para crear tu plan personalizado.</p>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-2xl font-semibold text-white">Información Básica</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Nombre</label>
                    <input type="text" name="name" value={profile.name} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Sexo Biológico</label>
                    <select name="sex" value={profile.sex} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                    </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Edad</label>
                  <input type="number" name="age" value={profile.age || ''} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Peso (kg)</label>
                  <input type="number" name="weight" value={profile.weight || ''} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Altura (cm)</label>
                  <input type="number" name="height" value={profile.height || ''} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"/>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="button" onClick={nextStep} className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition">Siguiente</button>
              </div>
            </div>
          )}

          {step === 2 && (
             <div className="space-y-4 animate-fade-in">
                <h2 className="text-2xl font-semibold text-white">Experiencia y Disponibilidad</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Nivel de Experiencia</label>
                    <select name="experience" value={profile.experience} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                        {EXPERIENCE_LEVELS.map(level => <option key={level.id} value={level.id}>{level.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Días para entrenar por semana ({profile.availability})</label>
                    <input type="range" min="1" max="7" name="availability" value={profile.availability} onChange={handleChange} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
                </div>
                <div className="flex justify-between pt-4">
                    <button type="button" onClick={prevStep} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition">Anterior</button>
                    <button type="button" onClick={nextStep} className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition">Siguiente</button>
                </div>
             </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-2xl font-semibold text-white">Objetivos</h2>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">¿Cuál es tu objetivo principal?</label>
                    <select name="goal" value={profile.goal} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                        {GOALS.map(goal => <option key={goal} value={goal}>{goal}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Tipo de Rutina Preferida</label>
                    <select name="routineType" value={profile.routineType} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                        {ROUTINE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <div className="flex justify-between pt-4">
                    <button type="button" onClick={prevStep} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition">Anterior</button>
                    <button type="button" onClick={nextStep} className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition">Siguiente</button>
                </div>
            </div>
          )}
          
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-2xl font-semibold text-white">Consideraciones Finales</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-300">¿Tienes alguna lesión previa o impedimento físico?</label>
                  <textarea name="injuries" value={profile.injuries} onChange={handleChange} placeholder="Ej: Dolor en la rodilla derecha, vieja lesión en el hombro..." rows={4} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                </div>
                <div className="flex justify-between pt-4">
                  <button type="button" onClick={prevStep} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition">Anterior</button>
                  <button type="submit" className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">Finalizar y Crear Plan</button>
                </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Onboarding;