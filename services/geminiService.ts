import { GoogleGenAI, Type, GenerateContentResponse, Chat, Modality, FunctionDeclaration } from '@google/genai';
import { UserProfile } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this project, we assume the API key is set in the environment.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const planGenerationModel = 'gemini-2.5-pro';
const chatModel = 'gemini-2.5-flash';

// Separate Schemas for robustness
const workoutPlanSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    dailyWorkouts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER },
          focus: { type: Type.STRING },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                sets: { type: Type.NUMBER },
                reps: { type: Type.STRING },
                rest: { type: Type.STRING },
                description: { type: Type.STRING, description: "Explicación TÉCNICA Y DETALLADA. Debe incluir: 1. Posición inicial. 2. Ejecución. 3. Un consejo clave." },
              },
              required: ['name', 'sets', 'reps', 'rest', 'description'],
            },
          },
        },
        required: ['day', 'focus', 'exercises'],
      },
    },
  },
  required: ['title', 'description', 'dailyWorkouts'],
};

const nutritionPlanSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    dailyPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING },
          focus: { type: Type.STRING, description: "Indica si es 'Día de Entrenamiento' o 'Día de Descanso'." },
          meals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                foods: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                macros: {
                    type: Type.OBJECT,
                    properties: {
                        protein: { type: Type.STRING },
                        carbs: { type: Type.STRING },
                        fats: { type: Type.STRING }
                    }
                }
              },
              required: ['name', 'foods'],
            },
          },
          dailyTotals: {
            type: Type.OBJECT,
            properties: {
                calories: { type: Type.STRING },
                protein: { type: Type.STRING },
                carbs: { type: Type.STRING },
                fats: { type: Type.STRING }
            }
          }
        },
        required: ['day', 'meals'],
      },
    },
  },
  required: ['title', 'description', 'dailyPlan'],
};

export const generatePlans = async (profile: UserProfile): Promise<{ workoutPlan: any; nutritionPlan: any }> => {
  const profileContext = `
    **Datos del Cliente:**
    - Nombre: ${profile.name}
    - Sexo Biológico: ${profile.sex === 'male' ? 'Masculino' : 'Femenino'}
    - Edad: ${profile.age} años
    - Peso: ${profile.weight} kg
    - Altura: ${profile.height} cm
    - Nivel de experiencia: ${profile.experience}
    - Días disponibles para entrenar: ${profile.availability} días a la semana
    - Objetivo principal: ${profile.goal}
    - Tipo de rutina preferida: ${profile.routineType}
    - Lesiones o limitaciones: ${profile.injuries || 'Ninguna especificada'}
  `;

  const workoutPrompt = `
    Eres Atlas 2.0, un entrenador personal de élite. Crea un plan de entrenamiento detallado (JSON).
    ${profileContext}

    **Instrucciones Plan de Entrenamiento:**
    - Crea un plan para los **${profile.availability} días** de entrenamiento.
    - Sé específico con los ejercicios, series, repeticiones (ej. "8-12 reps" o "Al fallo") y tiempo de descanso.
    - **IMPORTANTE (Campo 'description'):** Proporciona una explicación **PROFUNDA Y TÉCNICA** de la ejecución. 
      Estructura el texto para cubrir: 
      1. **Posición**: Cómo colocarse. 
      2. **Acción**: La fase excéntrica y concéntrica detallada. 
      3. **Tip**: Un consejo de respiración o biomecánica para evitar errores.
      (Máximo 60 palabras, pero denso en información útil).
    
    **IMPORTANTE - LÓGICA PARA "HEAVY DUTY (Mike Mentzer)":**
    Si el cliente eligió "Heavy Duty", aplica el principio de **PRE-AGOTAMIENTO** para grupos grandes (Pecho, Espalda, Cuádriceps, Hombros):
    1. Ejercicio de AISLAMIENTO (Fallo absoluto).
    2. Inmediatamente seguido de un ejercicio COMPUESTO.
    El volumen debe ser bajo, intensidad máxima.
  `;

  const nutritionPrompt = `
    Eres Atlas 2.0, un nutricionista experto. Crea un plan de nutrición detallado (JSON).
    ${profileContext}

    **Instrucciones Plan de Nutrición:**
    - Genera un plan completo para **7 DÍAS** (Lunes a Domingo).
    - Ajusta calorías según objetivo, sexo y nivel de actividad.
    - Usa alimentos comunes de Argentina (carnes, pastas, ensaladas, mate).
    - Sé conciso en 'foods' para no exceder límites de longitud (ej: "Bife de chorizo (200g) con ensalada mixta").
    - Provee macros diarios estimados.
  `;

  try {
    // Run both generations in parallel to save time and reduce single-request load
    const [workoutResponse, nutritionResponse] = await Promise.all([
        ai.models.generateContent({
            model: planGenerationModel,
            contents: [{ parts: [{ text: workoutPrompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: workoutPlanSchema,
            },
        }),
        ai.models.generateContent({
            model: planGenerationModel,
            contents: [{ parts: [{ text: nutritionPrompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: nutritionPlanSchema,
            },
        })
    ]);

    const workoutPlan = JSON.parse(workoutResponse.text);
    const nutritionPlan = JSON.parse(nutritionResponse.text);

    return {
      workoutPlan,
      nutritionPlan,
    };

  } catch (error) {
    console.error("Error generating plans:", error);
    throw new Error("Failed to generate plans from Gemini API.");
  }
};

let chat: Chat | null = null;

const generateNewPlansTool: FunctionDeclaration = {
  name: 'generateNewPlans',
  description: 'Genera un nuevo plan de entrenamiento y nutrición para el usuario basado en su perfil guardado. Usar solo cuando el usuario lo solicite explícitamente.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

export const startChat = () => {
  let userName = 'cliente';
  try {
      const savedProfile = localStorage.getItem('atlas2_userProfile');
      if (savedProfile) {
          userName = JSON.parse(savedProfile).name;
      }
  } catch (e) {
      console.warn("Could not parse user profile for chat init", e);
  }

  chat = ai.chats.create({
    model: chatModel,
    config: {
      systemInstruction: `Eres Atlas 2.0, un coach de fitness virtual amigable y experto. Tu propósito es responder preguntas sobre técnica de ejercicios, dar consejos de motivación, y ayudar al usuario con su viaje de fitness. Basa tus respuestas en el conocimiento general de fitness y biomecánica. Sé conciso y alentador. El usuario actual se llama ${userName}.`,
      tools: [{ functionDeclarations: [generateNewPlansTool] }],
    },
  });
};

export const sendMessageToCoach = async (message: string): Promise<GenerateContentResponse> => {
  if (!chat) {
    startChat();
  }
  
  if(chat){
    const response = await chat.sendMessage({ message });
    return response;
  }
  throw new Error("Chat not initialized");
};

export const sendToolResponseToCoach = async (toolResponses: { id: string; name: string; response: Record<string, any>; }[]): Promise<GenerateContentResponse> => {
    if (!chat) {
        throw new Error("Chat not initialized");
    }

    const response = await chat.sendMessage({
        message: toolResponses.map(toolResponse => ({
            functionResponse: toolResponse,
        })),
    });

    return response;
};
