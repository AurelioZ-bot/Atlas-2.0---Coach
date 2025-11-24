
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { EXPERIENCE_LEVELS, GOALS, ROUTINE_TYPES } from '../constants';

interface ProfileProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ userProfile, onUpdateProfile }) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: name === 'age' || name === 'weight' || name === 'height' || name === 'availability' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Hide message after 3 seconds
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-2xl shadow-lg max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-cyan-400 border-b border-gray-700 pb-2">Información Básica</h2>
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
                    <div className="grid grid-cols-3 gap-4">
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
                </div>

                {/* Training Info */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-cyan-400 border-b border-gray-700 pb-2">Preferencias de Entrenamiento</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Nivel de Experiencia</label>
                        <select name="experience" value={profile.experience} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500">
                            {EXPERIENCE_LEVELS.map(level => <option key={level.id} value={level.id}>{level.name}</option>)}
                        </select>
                    </div>
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
                </div>
            </div>

            {/* Other considerations */}
            <div>
                 <h2 className="text-2xl font-semibold text-cyan-400 border-b border-gray-700 pb-2 mt-4">Consideraciones Adicionales</h2>
                 <div>
                  <label className="block text-sm font-medium text-gray-300">Días para entrenar por semana ({profile.availability})</label>
                  <input type="range" min="1" max="7" name="availability" value={profile.availability} onChange={handleChange} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"/>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-300 mt-4">¿Tienes alguna lesión previa o impedimento físico?</label>
                  <textarea name="injuries" value={profile.injuries} onChange={handleChange} placeholder="Ej: Dolor en la rodilla derecha, vieja lesión en el hombro..." rows={3} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                </div>
            </div>

            <div className="flex justify-end items-center pt-4">
                {isSaved && <span className="text-green-400 mr-4">¡Perfil guardado! Tus planes se regenerarán.</span>}
                <button type="submit" className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 transition-transform transform hover:scale-105">
                    Guardar Cambios
                </button>
            </div>
             <p className="text-sm text-gray-400 text-right">*Al guardar, se generará un nuevo plan de entrenamiento y nutrición acorde a tus nuevos datos.</p>
        </form>
    </div>
  );
};

export default Profile;