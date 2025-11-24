
import React, { useState, useEffect } from 'react';
import { WorkoutPlan, DailyWorkout, Exercise } from '../types';
import { generateExerciseImages } from '../services/geminiService';

interface RoutineProps {
  workoutPlan: WorkoutPlan | null;
  setLoggingWorkout: (workout: DailyWorkout | null) => void;
}

const ImageSkeleton: React.FC = () => (
    <div className="w-full aspect-square bg-gray-700 rounded-lg animate-pulse flex items-center justify-center border border-gray-600">
        <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    </div>
);

const ExerciseCard: React.FC<{ 
    exercise: Exercise;
    exerciseId: string;
    isCompleted: boolean;
    onToggleComplete: (id: string) => void;
}> = ({ exercise, exerciseId, isCompleted, onToggleComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState<{ eccentricUrl: string; concentricUrl: string } | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !imageUrls && !isLoadingImages) {
      const fetchImages = async () => {
        setIsLoadingImages(true);
        setImageError(null);
        try {
          const urls = await generateExerciseImages(exercise.name);
          setImageUrls(urls);
        } catch (error) {
          console.error("Failed to fetch exercise images:", error);
          setImageError("No se pudieron cargar las imágenes del ejercicio.");
        } finally {
          setIsLoadingImages(false);
        }
      };

      fetchImages();
    }
  }, [isOpen, imageUrls, isLoadingImages, exercise.name]);

  return (
    <div className={`bg-gray-700 rounded-xl overflow-hidden transition-all duration-300 ${isCompleted ? 'opacity-60 bg-gray-800' : 'opacity-100 shadow-lg hover:bg-gray-600'}`}>
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
             <div className="relative flex items-center justify-center">
                <input 
                    type="checkbox" 
                    id={`cb-${exerciseId}`}
                    checked={isCompleted} 
                    onChange={() => onToggleComplete(exerciseId)}
                    className="peer appearance-none w-6 h-6 border-2 border-gray-500 rounded bg-gray-800 checked:bg-cyan-500 checked:border-cyan-500 transition-colors cursor-pointer"
                />
                <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
             </div>
            
            <div className="flex-1">
                <label htmlFor={`cb-${exerciseId}`} className={`font-bold text-lg text-white cursor-pointer select-none transition-colors block ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
                    {exercise.name}
                </label>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                    <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        {exercise.sets} series
                    </span>
                    <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        {exercise.reps}
                    </span>
                     <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {exercise.rest}
                    </span>
                </div>
            </div>
        </div>
        <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:bg-gray-600 hover:text-white'}`}
            aria-label={isOpen ? "Cerrar detalles" : "Ver detalles"}
        >
             <svg className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
      </div>
      
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-6 bg-gray-800/50 border-t border-gray-600 space-y-8">
            
            {/* Technical Description */}
            <div>
                <h5 className="font-semibold text-cyan-400 mb-3 flex items-center text-lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Técnica Correcta
                </h5>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700/50">
                     <p className="text-gray-300 leading-relaxed">{exercise.description || 'No hay descripción de técnica disponible.'}</p>
                </div>
            </div>
            
            {/* Visual Demonstration */}
            <div>
                <h5 className="font-semibold text-cyan-400 mb-4 flex items-center text-lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Demostración Visual
                </h5>
                
                {isLoadingImages && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-700 rounded w-1/3 animate-pulse"></div>
                            <ImageSkeleton />
                        </div>
                        <div className="space-y-2">
                             <div className="h-4 bg-gray-700 rounded w-1/3 animate-pulse"></div>
                            <ImageSkeleton />
                        </div>
                    </div>
                )}

                {imageError && (
                    <div className="bg-red-900/20 border border-red-800/50 p-6 rounded-lg text-center">
                        <svg className="w-10 h-10 text-red-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <p className="text-red-300 font-medium">{imageError}</p>
                        <button 
                            onClick={() => { setImageUrls(null); setIsOpen(false); setTimeout(() => setIsOpen(true), 50); }}
                            className="mt-3 px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-200 rounded-md text-sm transition-colors"
                        >
                            Intentar nuevamente
                        </button>
                    </div>
                )}

                {imageUrls && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
                        {/* Eccentric Card */}
                        <div className="group relative bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-700 hover:border-cyan-500/50 transition-all duration-300">
                             <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-black/60 to-transparent p-4 z-10 pointer-events-none">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
                                    Fase Excéntrica
                                </span>
                             </div>
                            <div className="aspect-square w-full bg-white relative">
                                 <img 
                                    src={imageUrls.eccentricUrl} 
                                    alt={`Fase excéntrica de ${exercise.name}`}
                                    className="w-full h-full object-contain p-6 transform transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                             <div className="p-3 bg-gray-800 border-t border-gray-700">
                                <p className="text-gray-400 text-sm text-center font-medium">Posición Inicial / Estiramiento</p>
                            </div>
                        </div>

                        {/* Concentric Card */}
                        <div className="group relative bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-700 hover:border-green-500/50 transition-all duration-300">
                            <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-black/60 to-transparent p-4 z-10 pointer-events-none">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-900/80 border border-green-500/30 text-green-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
                                    Fase Concéntrica
                                </span>
                             </div>
                            <div className="aspect-square w-full bg-white relative">
                                 <img 
                                    src={imageUrls.concentricUrl} 
                                    alt={`Fase concéntrica de ${exercise.name}`}
                                    className="w-full h-full object-contain p-6 transform transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="p-3 bg-gray-800 border-t border-gray-700">
                                <p className="text-gray-400 text-sm text-center font-medium">Posición Final / Contracción</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </div>
      </div>
    </div>
  );
};

const Routine: React.FC<RoutineProps> = ({ workoutPlan, setLoggingWorkout }) => {
  const [activeDay, setActiveDay] = useState<number | null>(workoutPlan?.dailyWorkouts[0]?.day ?? null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  
  // Load completed exercises for the active day from localStorage
  useEffect(() => {
    if (activeDay !== null) {
        const key = `atlas2_completedExercises_Day_${activeDay}`;
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                setCompletedExercises(new Set(JSON.parse(saved)));
            } else {
                setCompletedExercises(new Set());
            }
        } catch (e) {
            console.warn(`Error reading completed exercises for day ${activeDay}:`, e);
            setCompletedExercises(new Set());
        }
    }
  }, [activeDay]);

  const handleToggleExercise = (exerciseId: string) => {
    setCompletedExercises(prev => {
        const newSet = new Set(prev);
        if (newSet.has(exerciseId)) {
            newSet.delete(exerciseId);
        } else {
            newSet.add(exerciseId);
        }
        
        // Save to localStorage with a key specific to the active day
        if (activeDay !== null) {
            const key = `atlas2_completedExercises_Day_${activeDay}`;
            localStorage.setItem(key, JSON.stringify(Array.from(newSet)));
        }
        return newSet;
    });
  };

  if (!workoutPlan) {
    return <div className="text-center text-gray-400 p-8">No se ha cargado ningún plan de entrenamiento.</div>;
  }

  const activeDayData = workoutPlan.dailyWorkouts.find(d => d.day === activeDay);
  const totalExercises = activeDayData?.exercises.length ?? 0;
  const progressPercentage = totalExercises > 0 ? (completedExercises.size / totalExercises) * 100 : 0;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{workoutPlan.title}</h1>
            <p className="text-gray-400 mt-1 max-w-2xl">{workoutPlan.description}</p>
          </div>
          <div className="text-right hidden md:block">
             <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Coach: Atlas 2.0</span>
          </div>
      </div>
      
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {workoutPlan.dailyWorkouts.map(day => (
          <button 
            key={day.day} 
            onClick={() => setActiveDay(day.day)}
            className={`px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 shadow-sm ${
                activeDay === day.day 
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white scale-105 shadow-cyan-900/20' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Día {day.day}: {day.focus}
          </button>
        ))}
      </div>

      <div>
        {activeDayData && (
          <div key={activeDayData.day} className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl space-y-6 animate-slide-in-up">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                 <h2 className="text-2xl font-bold text-white flex items-center">
                    <span className="text-cyan-400 mr-2">#</span>
                    {activeDayData.focus}
                 </h2>
                 <button onClick={() => setLoggingWorkout(activeDayData)} className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 w-full md:w-auto">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Iniciar Sesión
                 </button>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/30">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-300">Progreso de la sesión</span>
                    <span className="text-sm font-bold text-cyan-400">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-700 ease-out ${progressPercentage === 100 ? 'bg-green-500' : 'bg-cyan-500'}`}
                        style={{ width: `${progressPercentage}%` }}>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
              {activeDayData.exercises.map((exercise, index) => {
                const exerciseId = `${activeDayData.day}-${index}`;
                return (
                    <ExerciseCard 
                        key={exerciseId} 
                        exercise={exercise} 
                        exerciseId={exerciseId}
                        isCompleted={completedExercises.has(exerciseId)}
                        onToggleComplete={handleToggleExercise}
                    />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Routine;
