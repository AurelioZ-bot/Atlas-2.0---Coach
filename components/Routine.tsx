
import React, { useState, useEffect } from 'react';
import { WorkoutPlan, DailyWorkout, Exercise } from '../types';

interface RoutineProps {
  workoutPlan: WorkoutPlan | null;
  setWorkoutPlan: (plan: WorkoutPlan | null) => void;
  setLoggingWorkout: (workout: DailyWorkout | null) => void;
}

const ExerciseCard: React.FC<{ 
    exercise: Exercise;
    exerciseId: string;
    isCompleted: boolean;
    onToggleComplete: (id: string) => void;
    // DND Props
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
}> = ({ exercise, exerciseId, isCompleted, onToggleComplete, draggable, onDragStart, onDragOver, onDrop }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
        className={`bg-gray-700 rounded-xl overflow-hidden transition-all duration-300 ${isCompleted ? 'opacity-60 bg-gray-800' : 'opacity-100 shadow-lg hover:bg-gray-600'} group`}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
    >
      <div className="p-4 flex justify-between items-center cursor-move md:cursor-default">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
             
             {/* Drag Handle Icon - Visible on hover or touch */}
             <div className="hidden group-hover:block md:block cursor-move text-gray-500 hover:text-cyan-400" title="Arrastrar para reordenar">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
             </div>

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
      
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-6 bg-gray-800/50 border-t border-gray-600 space-y-4">
            
            {/* Technical Description */}
            <div>
                <h5 className="font-semibold text-cyan-400 mb-3 flex items-center text-lg">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Guía Técnica y Ejecución
                </h5>
                <div className="bg-gray-800 p-5 rounded-lg border border-gray-700/50 shadow-inner">
                     <p className="text-gray-300 leading-relaxed whitespace-pre-line text-base">
                        {exercise.description || 'No hay descripción de técnica disponible.'}
                     </p>
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};

const Routine: React.FC<RoutineProps> = ({ workoutPlan, setWorkoutPlan, setLoggingWorkout }) => {
  const [activeDay, setActiveDay] = useState<number | null>(workoutPlan?.dailyWorkouts[0]?.day ?? null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Ensure activeDay is set when workoutPlan loads if it was previously null
  useEffect(() => {
    if (workoutPlan?.dailyWorkouts?.[0]?.day && activeDay === null) {
      setActiveDay(workoutPlan.dailyWorkouts[0].day);
    }
  }, [workoutPlan, activeDay]);

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

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
      setDraggedItemIndex(index);
      // DataTransfer for compatibility, though we use state primarily
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
      // Make drag ghost slightly transparent
      if (e.target instanceof HTMLElement) {
          e.target.style.opacity = '0.5';
      }
  };

  const handleDragEnd = (e: React.DragEvent) => {
      setDraggedItemIndex(null);
      if (e.target instanceof HTMLElement) {
          e.target.style.opacity = '';
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      
      // Reset styles
      if (e.target instanceof HTMLElement) {
         e.target.style.opacity = '';
      }

      const dragIndex = draggedItemIndex;
      if (dragIndex === null || dragIndex === dropIndex) return;

      if (!workoutPlan || activeDay === null) return;

      // Deep copy to ensure state update triggers
      const newPlan = JSON.parse(JSON.stringify(workoutPlan));
      const dayIndex = newPlan.dailyWorkouts.findIndex((d: DailyWorkout) => d.day === activeDay);

      if (dayIndex === -1) return;

      const exercises = newPlan.dailyWorkouts[dayIndex].exercises;
      
      // Reorder logic
      const [draggedItem] = exercises.splice(dragIndex, 1);
      exercises.splice(dropIndex, 0, draggedItem);
      
      // Update state
      setWorkoutPlan(newPlan);
      setDraggedItemIndex(null);
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
                        key={exerciseId} // Key remains stable based on content position for reorder
                        exercise={exercise} 
                        exerciseId={exerciseId}
                        isCompleted={completedExercises.has(exerciseId)}
                        onToggleComplete={handleToggleExercise}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                    />
                );
              })}
            </div>
            
            <p className="text-xs text-center text-gray-500 mt-4">
                Tip: Arrastra los ejercicios desde el icono de las barras para reordenarlos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Routine;
