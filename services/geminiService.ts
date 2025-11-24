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

const planResponseSchema = {
  type: Type.OBJECT,
  properties: {
    workoutPlan: {
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
                    description: { type: Type.STRING, description: "Instrucciones detalladas paso a paso sobre cómo ejecutar el ejercicio correctamente." },
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
    },
    nutritionPlan: {
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
    },
  },
};

export const generatePlans = async (profile: UserProfile): Promise<{ workoutPlan: any; nutritionPlan: any }> => {
  const prompt = `
    Eres Atlas 2.0, un entrenador personal y nutricionista de élite. Tu tarea es crear un plan de entrenamiento y nutrición detallado y personalizado para un cliente, devolviendo el resultado en un único JSON.

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

    **Instrucciones Generales:**
    1.  Ambos planes deben estar alineados con los objetivos, experiencia, SEXO (influye en cálculo calórico y énfasis hormonal) y limitaciones del cliente.
    2.  El tono debe ser motivador, profesional y claro.
    3.  Debes devolver el resultado estrictamente en formato JSON, siguiendo el esquema proporcionado.

    **Instrucciones Detalladas:**

    **1. Plan de Entrenamiento (WorkoutPlan):**
    - Crea un plan para los **${profile.availability} días** de entrenamiento disponibles.
    - Sé específico con los ejercicios, series, repeticiones (ej. "8-12 reps" o "Al fallo") y tiempo de descanso.
    - **IMPORTANTE (Campo 'description'):** Proporciona una guía paso a paso clara de CÓMO ejecutar el ejercicio. Incluye: Posición inicial, movimiento (fases concéntrica/excéntrica) y errores comunes a evitar. No seas genérico.
    
    **IMPORTANTE - LÓGICA PARA "HEAVY DUTY (Mike Mentzer)":**
    Si el cliente eligió "Heavy Duty", debes aplicar ESTRICTAMENTE el principio de **PRE-AGOTAMIENTO** para los grupos musculares grandes (Pecho, Espalda, Cuádriceps, Hombros).
    El orden de los ejercicios es prioritario e innegociable:
    1.  **Primer Ejercicio:** Debe ser un ejercicio de **AISLAMIENTO (Monoarticular)** llevado al fallo absoluto.
    2.  **Segundo Ejercicio:** Debe ser un ejercicio **COMPUESTO (Multiarticular)** para el mismo grupo muscular, realizado inmediatamente después.
    
    Ejemplos de combinaciones requeridas para Heavy Duty:
    - **Cuádriceps:** Extensiones de pierna (Aislamiento) -> SEGUIDO DE -> Prensa de piernas o Sentadilla (Compuesto).
    - **Pecho:** Aperturas con mancuernas o Pec Deck (Aislamiento) -> SEGUIDO DE -> Press de banca o Press inclinado (Compuesto).
    - **Espalda:** Pullover (Aislamiento) -> SEGUIDO DE -> Jalones en polea o Dominadas (Compuesto).
    - **Hombros:** Elevaciones laterales (Aislamiento) -> SEGUIDO DE -> Press Militar o Tras nuca (Compuesto).
    
    El volumen para Heavy Duty debe ser bajo (pocas series, altísima intensidad).

    **2. Plan de Nutrición (NutritionPlan):**
    - **PRIORIDAD:** Debes generar un plan completo para **7 DÍAS** (Lunes a Domingo). No cortes la respuesta.
    - **Estructura:** El array JSON \`dailyPlan\` debe contener 7 objetos.
    - **Diferenciación:** Ajusta calorías según si es día de entreno o descanso.
    - **Alimentos:** Usa alimentos y platos comunes de Argentina (ej: bife de chorizo, milanesa al horno, ensalada mixta, mate, etc.).
    - **Concisión:** Sé directo en la lista de 'foods' para asegurar que la respuesta JSON completa quepa en el límite de tokens. Ejemplo: "Bife de chorizo (200g) con ensalada mixta" en lugar de descripciones muy largas.
    - **Macros:** Provee los totales diarios estimados.

  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: planGenerationModel,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: planResponseSchema,
      },
    });

    const jsonResponse = JSON.parse(response.text);
    return {
      workoutPlan: jsonResponse.workoutPlan,
      nutritionPlan: jsonResponse.nutritionPlan,
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

export const generateExerciseImages = async (exerciseName: string): Promise<{ eccentricUrl: string; concentricUrl: string }> => {
  const generateImage = async (prompt: string): Promise<string> => {
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
      });

      const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (base64ImageBytes) {
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      }
      throw new Error("No image data found in response.");
    } catch (error) {
      console.error(`Error generating image for prompt "${prompt}":`, error);
      throw new Error("Failed to generate exercise image.");
    }
  };

  // Using English prompts often yields better results for image generation models
  const eccentricPrompt = `Technical fitness illustration, clean minimalist line art on white background. A fit athletic character demonstrating the starting position (eccentric phase) of the exercise: ${exerciseName}. High quality, anatomically accurate, professional drawing.`;
  const concentricPrompt = `Technical fitness illustration, clean minimalist line art on white background. A fit athletic character demonstrating the ending position (concentric phase) of the exercise: ${exerciseName}. High quality, anatomically accurate, professional drawing.`;

  // Run in parallel to speed it up
  const [eccentricUrl, concentricUrl] = await Promise.all([
    generateImage(eccentricPrompt),
    generateImage(concentricPrompt)
  ]);

  return { eccentricUrl, concentricUrl };
};