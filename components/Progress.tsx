
import React from 'react';
import { WorkoutLog } from '../types';

interface ProgressProps {
  workoutHistory: WorkoutLog[];
}

const Progress: React.FC<ProgressProps> = ({ workoutHistory }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white">Mi Progreso</h1>

      {workoutHistory.length === 0 ? (
        <div className="text-center bg-gray-800 p-8 rounded-2xl">
          <p className="text-gray-400">Aún no has registrado ningún entrenamiento. ¡Completa una sesión para ver tu progreso aquí!</p>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Historial de Entrenamientos</h2>
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
            {workoutHistory.slice().reverse().map((log, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg">
                <div className="mb-3">
                  <p className="font-bold text-white text-lg">{new Date(log.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-cyan-400 font-semibold">{log.workoutFocus}</p>
                </div>
                <div className="space-y-4">
                  {log.exercises.map((ex, i) => (
                    <div key={i} className="bg-gray-600/50 p-3 rounded-md">
                      <h4 className="font-semibold text-white">{ex.exerciseName}</h4>
                      <div className="mt-2 space-y-1 text-sm">
                          <div className="grid grid-cols-3 gap-2 font-medium text-gray-400 px-2">
                              <span>Serie</span>
                              <span className="text-center">Peso (kg)</span>
                              <span className="text-center">Reps</span>
                          </div>
                          {ex.sets.map((set, setIndex) => (
                              <div key={setIndex} className="grid grid-cols-3 gap-2 text-gray-200 bg-gray-900/20 p-2 rounded">
                                  <span className="px-2">{setIndex + 1}</span>
                                  <span className="text-center">{set.weight} kg</span>
                                  <span className="text-center">{set.reps}</span>
                              </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
