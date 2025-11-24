
import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToCoach, startChat, generatePlans, sendToolResponseToCoach } from '../services/geminiService';
import { UserProfile, WorkoutPlan, NutritionPlan } from '../types';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

// Check for SpeechRecognition API support
// FIX: Cast window to `any` to access non-standard `SpeechRecognition` and rename to `SpeechRecognitionAPI` to avoid conflict with the `SpeechRecognition` type.
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface CoachChatProps {
    isSubscribed: boolean;
    userProfile: UserProfile;
    setWorkoutPlan: (plan: WorkoutPlan | null) => void;
    setNutritionPlan: (plan: NutritionPlan | null) => void;
}

const CoachChat: React.FC<CoachChatProps> = ({ isSubscribed, userProfile, setWorkoutPlan, setNutritionPlan }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // FIX: Use 'any' type for SpeechRecognition as it is not a standard TS type.
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    startChat(); // Initialize chat session when component mounts
    setMessages([{ sender: 'bot', text: '¡Hola! Soy Atlas 2.0. ¿En qué puedo ayudarte hoy? Pregúntame sobre técnicas de ejercicio, o pídeme que te genere un nuevo plan.' }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup speech recognition on component unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // 1. Send message and get initial response (might contain function calls)
      const response = await sendMessageToCoach(currentInput);
      
      const responseText = response.text;
      if (responseText) {
        setMessages(prev => [...prev, { sender: 'bot', text: responseText }]);
      }
      
      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        // 2. If there are function calls, execute them
        setMessages(prev => [...prev, { sender: 'bot', text: 'Entendido. Estoy generando tus nuevos planes...' }]);
        
        const toolResponses = [];

        for (const call of functionCalls) {
          if (call.name === 'generateNewPlans') {
            try {
              const plans = await generatePlans(userProfile);
              setWorkoutPlan(plans.workoutPlan);
              setNutritionPlan(plans.nutritionPlan);
              toolResponses.push({
                id: call.id,
                name: call.name,
                response: { success: true, message: 'Planes generados exitosamente.' }
              });
            } catch (error) {
               console.error('Error executing generateNewPlans:', error);
               toolResponses.push({
                 id: call.id,
                 name: call.name,
                 response: { success: false, error: 'Falló la generación de planes.' }
               });
            }
          }
        }
        
        // 3. Send tool responses back to the model
        if (toolResponses.length > 0) {
            const finalResponse = await sendToolResponseToCoach(toolResponses);
            setMessages(prev => {
                const newMessages = [...prev];
                // Replace "Generating..." message with the final response
                const lastMsgIndex = newMessages.length - 1;
                if (newMessages[lastMsgIndex].text.includes('generando')) {
                    newMessages[lastMsgIndex] = { sender: 'bot', text: finalResponse.text };
                } else {
                    newMessages.push({ sender: 'bot', text: finalResponse.text });
                }
                return newMessages;
            });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Lo siento, estoy teniendo problemas para conectarme. Intenta de nuevo más tarde.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (!SpeechRecognitionAPI) {
      alert("Lo siento, tu navegador no soporta el reconocimiento de voz.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.lang = 'es-AR';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Error de reconocimiento de voz:", event.error);
        alert(`Error de reconocimiento: ${event.error}`);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
    }
  };

  if (!isSubscribed) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-800 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-red-400">Acceso Denegado</h2>
        <p className="text-gray-300 mt-2">Necesitas una suscripción activa para usar el chat con el coach.</p>
        <p className="text-gray-400 mt-1">Por favor, ve a la sección de Suscripción para activarla.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[85vh] bg-gray-800 rounded-2xl shadow-lg animate-fade-in">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white text-center">Chat con Atlas 2.0</h1>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                {msg.text || <span className="animate-pulse">...</span>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Escuchando..." : "Escribe tu pregunta aquí..."}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={isLoading}
          />
           <button type="button" onClick={handleMicClick} className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-cyan-600 hover:bg-cyan-700'}`}>
            <MicIcon />
          </button>
          <button type="submit" className="p-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 disabled:bg-gray-600" disabled={isLoading || !input.trim()}>
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;

export default CoachChat;
