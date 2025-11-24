import React, { useState, useEffect } from 'react';
import { UserProfile, WorkoutPlan, NutritionPlan, DailyWorkout } from '../types';

interface HomeProps {
  userProfile: UserProfile;
  workoutPlan: WorkoutPlan | null;
  nutritionPlan: NutritionPlan | null;
  setLoggingWorkout: (workout: DailyWorkout | null) => void;
  isLoading: boolean;
  error: string | null;
}

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);
  

const LoadingSpinner: React.FC = () => {
    const loadingSteps = [
        "Analizando tu perfil biométrico...",
        "Consultando la base de datos de ejercicios...",
        "Diseñando rutina de hipertrofia y fuerza...",
        "Calculando macronutrientes óptimos...",
        "Personalizando recomendaciones de suplementación...",
        "Generando visualizaciones de ejercicios...",
        "Finalizando tu Plan Atlas 2.0..."
    ];
    
    const tips = [
        "Tip: La hidratación es clave para el rendimiento muscular.",
        "Tip: Dormir 7-8 horas ayuda a la recuperación y crecimiento.",
        "Tip: La consistencia supera a la intensidad a largo plazo.",
        "Tip: Escucha a tu cuerpo para evitar lesiones.",
        "Tip: La proteína es esencial en cada comida."
    ];

    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [currentTip, setCurrentTip] = useState(0);

    useEffect(() => {
        const stepDuration = 1000;
        const totalDuration = stepDuration * loadingSteps.length + 1000;

        // Timer for progress bar
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 100;
                return prev + (100 / (totalDuration / 100));
            });
        }, 100);

        // Timer for steps
        const stepInterval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < loadingSteps.length - 1) return prev + 1;
                return prev;
            });
        }, stepDuration);

        // Timer for tips
        const tipInterval = setInterval(() => {
             setCurrentTip(prev => (prev + 1) % tips.length);
        }, 3000);

        return () => {
            clearInterval(progressInterval);
            clearInterval(stepInterval);
            clearInterval(tipInterval);
        };
    }, []);


    return (
        <div className="flex flex-col items-center justify-center space-y-6 text-center p-4 w-full max-w-2xl mx-auto">
             {/* Animated Icon */}
             <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <div className="relative bg-gray-900/50 p-4 rounded-full border border-cyan-500/30 shadow-lg">
                    <SparklesIcon className="w-10 h-10 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Atlas 2.0 está trabajando</h3>
                <p className="text-cyan-400 text-sm font-medium animate-pulse">Gemini está creando tus planes personalizados...</p>
            </div>
            
             {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden relative">
                <div 
                    className="absolute top-0 left-0 h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-200 ease-linear"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
            </div>
            
            {/* Steps List */}
            <div className="w-full space-y-2 text-left bg-gray-900/30 p-4 rounded-xl border border-gray-700/50">
                {loadingSteps.map((step, index) => (
                <div 
                    key={index}
                    className={`flex items-center space-x-3 transition-all duration-500 ${
                        index === currentStep ? 'transform translate-x-1' : 'opacity-70'
                    }`}
                >
                    <div className="shrink-0 w-5 flex justify-center">
                        {index < currentStep ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-400" />
                        ) : index === currentStep ? (
                            <div className="relative w-2.5 h-2.5">
                                <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping"></div>
                                <div className="relative w-2.5 h-2.5 bg-cyan-400 rounded-full"></div>
                            </div>
                        ) : (
                            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        )}
                    </div>
                    <span className={`text-sm transition-colors duration-300 ${
                        index === currentStep ? 'text-cyan-200 font-medium' : 
                        index < currentStep ? 'text-gray-400 line-through decoration-gray-600' : 'text-gray-500'
                    }`}>
                    {step}
                    </span>
                </div>
                ))}
            </div>

             {/* Tips Carousel */}
             <div className="h-8 flex items-center justify-center">
                 <p key={currentTip} className="text-xs text-cyan-300/80 italic animate-fade-in">
                    {tips[currentTip]}
                </p>
            </div>
        </div>
    );
};


const Home: React.FC<HomeProps> = ({ userProfile, workoutPlan, nutritionPlan, setLoggingWorkout, isLoading, error }) => {

  const handleStartWorkout = () => {
    if (workoutPlan?.dailyWorkouts?.[0]) {
      setLoggingWorkout(workoutPlan.dailyWorkouts[0]);
    }
  };


  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-white">Bienvenido de nuevo, {userProfile.name}!</h1>
        <p className="text-lg text-gray-400 mt-2">¿Listo para superar tus límites hoy?</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg min-h-[300px] flex items-center justify-center relative overflow-hidden">
        {isLoading && <LoadingSpinner />}
        {error && <p className="text-red-400 text-center">{error}</p>}
        {!isLoading && !error && workoutPlan && nutritionPlan && (
          <div className="text-center w-full animate-fade-in">
             <div className="flex justify-center mb-4">
                 <CheckCircleIcon className="w-16 h-16 text-green-500" />
             </div>
            <h2 className="text-2xl font-semibold text-cyan-400">¡Tus planes están listos!</h2>
            <p className="text-gray-300 mt-2">Hemos creado un plan de entrenamiento y nutrición a tu medida.</p>
             <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Rutina</p>
                    <p className="font-semibold text-white">{workoutPlan.title}</p>
                </div>
                 <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Nutrición</p>
                    <p className="font-semibold text-white">{nutritionPlan.title}</p>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-white">Resumen del Perfil</h3>
          <ul className="mt-4 space-y-2 text-gray-300">
            <li><strong>Objetivo:</strong> {userProfile.goal}</li>
            <li><strong>Experiencia:</strong> {userProfile.experience}</li>
            <li><strong>Rutina:</strong> {userProfile.routineType}</li>
            <li><strong>Disponibilidad:</strong> {userProfile.availability} días/semana</li>
          </ul>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-white">Entrenamiento de hoy</h3>
          {workoutPlan?.dailyWorkouts?.[0] ? (
            <div className="mt-4 space-y-2 text-gray-300">
              <p className="font-bold text-cyan-400">{workoutPlan.dailyWorkouts[0].focus}</p>
              <p>{workoutPlan.dailyWorkouts[0].exercises.length} ejercicios planificados.</p>
              <button 
                onClick={handleStartWorkout}
                className="mt-2 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition">
                Empezar Entrenamiento
              </button>
            </div>
          ) : (
            <p className="mt-4 text-gray-400">
              {isLoading ? 'Analizando datos...' : 'No hay entrenamiento planificado o el plan no se ha cargado.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;