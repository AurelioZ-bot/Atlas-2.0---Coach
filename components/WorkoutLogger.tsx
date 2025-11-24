
import React, { useState, useRef, useEffect } from 'react';
import { DailyWorkout, WorkoutLog, ExerciseLog } from '../types';

interface WorkoutLoggerProps {
  dailyWorkout: DailyWorkout;
  onLogComplete: (log: WorkoutLog) => void;
  onCancel: () => void;
}

// Speech Recognition Interface
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ dailyWorkout, onLogComplete, onCancel }) => {
    const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(
        dailyWorkout.exercises.map(ex => ({
            exerciseName: ex.name,
            sets: Array.from({ length: ex.sets }, () => ({ reps: 0, weight: 0 }))
        }))
    );

    const [listeningExerciseIdx, setListeningExerciseIdx] = useState<number | null>(null);
    const recognitionRef = useRef<any | null>(null);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Web Audio API Sound Feedback
    const playFeedbackSound = (type: 'set' | 'finish') => {
        try {
            const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            
            const ctx = new AudioContext();
            const now = ctx.currentTime;

            if (type === 'set') {
                // Subtle positive "ding" (Sine wave with quick decay)
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now); // A5
                osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1); // A6

                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(now);
                osc.stop(now + 0.5);
            } else if (type === 'finish') {
                // Success Major Chord Arpeggio (C - E - G)
                const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
                notes.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const time = now + (i * 0.1);

                    osc.type = 'triangle';
                    osc.frequency.value = freq;

                    gain.gain.setValueAtTime(0.05, time);
                    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(time);
                    osc.stop(time + 1.5);
                });
            }
        } catch (e) {
            console.error("Error playing audio feedback", e);
        }
    };

    const handleSetChange = (exIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) => {
        const numericValue = parseInt(value, 10) || 0;
        setExerciseLogs(prevLogs => 
            prevLogs.map((log, i) => {
                if (i !== exIndex) return log;
                return {
                    ...log,
                    sets: log.sets.map((set, j) => {
                        if (j !== setIndex) return set;
                        return { ...set, [field]: numericValue };
                    })
                };
            })
        );
    };

    const handleInputBlur = (exIndex: number, setIndex: number) => {
        const set = exerciseLogs[exIndex].sets[setIndex];
        // If both fields are filled, play a subtle sound to indicate completion
        if (set.reps > 0 && set.weight > 0) {
            // Simple debounce/logic check could be added here to prevent spamming,
            // but for now it provides immediate confirmation on data entry.
            playFeedbackSound('set');
        }
    };

    const processVoiceCommand = (transcript: string, exIndex: number) => {
        const lowerTranscript = transcript.toLowerCase();
        console.log("Comando de voz:", lowerTranscript);

        // 1. Detectar número de serie (opcional, ej: "serie 2")
        const serieMatch = lowerTranscript.match(/(?:serie|set)\s*(\d+)/);
        
        // 2. Detectar Repeticiones (ej: "12 repeticiones", "10 reps")
        const repsMatch = lowerTranscript.match(/(\d+)\s*(?:rep|reps|repeticiones)/);
        
        // 3. Detectar Peso (ej: "50 kilos", "20 kg")
        const weightMatch = lowerTranscript.match(/(\d+)\s*(?:kilos|kg|libras|lbs)/);

        if (repsMatch || weightMatch) {
            let updated = false;
            setExerciseLogs(prevLogs => {
                const newLogs = [...prevLogs];
                const targetExercise = newLogs[exIndex];
                
                let targetSetIndex = -1;

                if (serieMatch) {
                    const specifiedSet = parseInt(serieMatch[1], 10) - 1;
                    if (specifiedSet >= 0 && specifiedSet < targetExercise.sets.length) {
                        targetSetIndex = specifiedSet;
                    }
                } else {
                    targetSetIndex = targetExercise.sets.findIndex(s => s.reps === 0);
                    if (targetSetIndex === -1) targetSetIndex = targetExercise.sets.length - 1;
                }

                if (targetSetIndex !== -1) {
                    updated = true;
                    newLogs[exIndex] = {
                        ...targetExercise,
                        sets: targetExercise.sets.map((set, idx) => {
                            if (idx !== targetSetIndex) return set;
                            return {
                                ...set,
                                reps: repsMatch ? parseInt(repsMatch[1], 10) : set.reps,
                                weight: weightMatch ? parseInt(weightMatch[1], 10) : set.weight
                            };
                        })
                    };
                }
                return newLogs;
            });

            if (updated) {
                playFeedbackSound('set');
            }
        }
    };

    const toggleListening = (exIndex: number) => {
        if (!SpeechRecognitionAPI) {
            alert("Tu navegador no soporta reconocimiento de voz.");
            return;
        }

        if (listeningExerciseIdx === exIndex) {
            // Stop listening
            recognitionRef.current?.stop();
            setListeningExerciseIdx(null);
        } else {
            // Start listening for new index
            if (recognitionRef.current) recognitionRef.current.stop();

            const recognition = new SpeechRecognitionAPI();
            recognition.lang = 'es-AR'; // Ajustar según región si es necesario
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                setListeningExerciseIdx(exIndex);
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                processVoiceCommand(transcript, exIndex);
                setListeningExerciseIdx(null);
            };

            recognition.onerror = (event: any) => {
                console.error("Error de voz:", event.error);
                setListeningExerciseIdx(null);
            };

            recognition.onend = () => {
                setListeningExerciseIdx(null);
            };

            recognitionRef.current = recognition;
            recognition.start();
        }
    };

    const handleSaveLog = () => {
        playFeedbackSound('finish');
        const log: WorkoutLog = {
            date: new Date().toISOString().split('T')[0],
            workoutFocus: dailyWorkout.focus,
            exercises: exerciseLogs
                .map(exLog => ({
                    ...exLog,
                    sets: exLog.sets.filter(set => set.reps > 0 || set.weight > 0)
                }))
                .filter(exLog => exLog.sets.length > 0),
        };
        // Slight delay to allow sound to start playing before unmount
        setTimeout(() => {
            onLogComplete(log);
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" role="document">
                <div className="p-6 border-b border-gray-700">
                    <h2 id="workout-logger-title" className="text-2xl font-bold text-cyan-400">Registrar Entrenamiento: {dailyWorkout.focus}</h2>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    {exerciseLogs.map((exLog, exIndex) => (
                        <div key={exIndex} className="bg-gray-700 p-4 rounded-lg transition-colors duration-300 border border-transparent">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-lg text-white">{exLog.exerciseName}</h3>
                                <button 
                                    onClick={() => toggleListening(exIndex)}
                                    className={`p-2 rounded-full transition-all flex items-center space-x-2 ${
                                        listeningExerciseIdx === exIndex 
                                        ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500 animate-pulse' 
                                        : 'bg-gray-600 text-gray-300 hover:bg-cyan-600 hover:text-white'
                                    }`}
                                    title="Dictar series por voz"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                    {listeningExerciseIdx === exIndex && <span className="text-xs font-bold">Escuchando...</span>}
                                </button>
                            </div>
                            
                            {listeningExerciseIdx === exIndex && (
                                <div className="mb-3 text-xs text-gray-400 bg-gray-800/50 p-2 rounded border border-gray-600">
                                    Di: "Serie 1, 10 reps, 20 kilos" o simplemente "10 reps, 20 kilos"
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-2 items-center text-sm font-semibold text-gray-400 px-2">
                                    <span>Serie</span>
                                    <span className="text-center">Peso (kg)</span>
                                    <span className="text-center">Repeticiones</span>
                                </div>
                                {exLog.sets.map((set, setIndex) => (
                                    <div key={setIndex} className="grid grid-cols-3 gap-2 items-center">
                                        <span className="text-gray-300 px-2">Serie {setIndex + 1}</span>
                                        <input 
                                            type="number"
                                            placeholder="kg"
                                            value={set.weight === 0 ? '' : set.weight}
                                            onChange={(e) => handleSetChange(exIndex, setIndex, 'weight', e.target.value)}
                                            onBlur={() => handleInputBlur(exIndex, setIndex)}
                                            aria-label={`Peso para ${exLog.exerciseName} serie ${setIndex + 1}`}
                                            className="w-full bg-gray-600 border border-gray-500 rounded-md py-1 px-2 text-center text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                        <input 
                                            type="number"
                                            placeholder="reps"
                                            value={set.reps === 0 ? '' : set.reps}
                                            onChange={(e) => handleSetChange(exIndex, setIndex, 'reps', e.target.value)}
                                            onBlur={() => handleInputBlur(exIndex, setIndex)}
                                            aria-label={`Repeticiones para ${exLog.exerciseName} serie ${setIndex + 1}`}
                                            className="w-full bg-gray-600 border border-gray-500 rounded-md py-1 px-2 text-center text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end space-x-4 p-6 border-t border-gray-700 mt-auto">
                    <button onClick={onCancel} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition">
                        Cancelar
                    </button>
                    <button onClick={handleSaveLog} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">
                        Guardar Entrenamiento
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkoutLogger;
