
export interface UserProfile {
  name: string;
  phone?: string; // Changed from email to phone
  sex: 'male' | 'female';
  age: number;
  weight: number;
  height: number;
  experience: 'beginner' | 'intermediate' | 'advanced';
  availability: number;
  goal: string;
  routineType: string;
  injuries: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  description?: string;
}

export interface DailyWorkout {
  day: number;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  title: string;
  description: string;
  dailyWorkouts: DailyWorkout[];
}

export interface Meal {
  name: string;
  foods: string[];
  macros?: {
    protein: string;
    carbs: string;
    fats: string;
  };
}

export interface DailyNutrition {
  day: string;
  focus?: string;
  meals: Meal[];
  dailyTotals?: {
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
  }
}

export interface NutritionPlan {
  title: string;
  description: string;
  dailyPlan: DailyNutrition[];
}

export interface SetLog {
  reps: number;
  weight: number;
}

export interface ExerciseLog {
  exerciseName: string;
  sets: SetLog[];
}

export interface WorkoutLog {
  date: string;
  workoutFocus: string;
  exercises: ExerciseLog[];
}

export interface RegisteredUser {
  phone: string; // Identifier
  name: string;
  isActive: boolean;
  registrationDate: string;
}
