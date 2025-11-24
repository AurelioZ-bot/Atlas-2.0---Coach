import React, { useState, useEffect } from 'react';
import { UserProfile, WorkoutPlan, NutritionPlan, WorkoutLog } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true); // Start as subscribed for demo purposes
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
  const [subscriptionPrice, setSubscriptionPrice] = useState<number>(17000);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('atlas2_userProfile');
      const savedHistory = localStorage.getItem('atlas2_workoutHistory');
      const savedPrice = localStorage.getItem('atlas2_subscriptionPrice');
      const savedWorkoutPlan = localStorage.getItem('atlas2_workoutPlan');
      const savedNutritionPlan = localStorage.getItem('atlas2_nutritionPlan');

      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
      if (savedHistory) {
        setWorkoutHistory(JSON.parse(savedHistory));
      }
      if (savedPrice) {
        setSubscriptionPrice(JSON.parse(savedPrice));
      }
      if (savedWorkoutPlan) {
        setWorkoutPlan(JSON.parse(savedWorkoutPlan));
      }
      if (savedNutritionPlan) {
        setNutritionPlan(JSON.parse(savedNutritionPlan));
      }
    } catch (error) {
      console.error("Failed to load data from local storage", error);
      // Optionally clear corrupted data
      // localStorage.clear();
    }
  }, []);

  // Save Workout Plan when it changes
  useEffect(() => {
    if (workoutPlan) {
      localStorage.setItem('atlas2_workoutPlan', JSON.stringify(workoutPlan));
    }
  }, [workoutPlan]);

  // Save Nutrition Plan when it changes
  useEffect(() => {
    if (nutritionPlan) {
      localStorage.setItem('atlas2_nutritionPlan', JSON.stringify(nutritionPlan));
    }
  }, [nutritionPlan]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('atlas2_userProfile', JSON.stringify(profile));
  };
  
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem('atlas2_userProfile', JSON.stringify(updatedProfile));
    // Regenerate plans upon profile update
    setWorkoutPlan(null);
    setNutritionPlan(null);
    localStorage.removeItem('atlas2_workoutPlan');
    localStorage.removeItem('atlas2_nutritionPlan');
  };
  
  const handleUpdatePrice = (newPrice: number) => {
    setSubscriptionPrice(newPrice);
    localStorage.setItem('atlas2_subscriptionPrice', JSON.stringify(newPrice));
  };

  const handleLogout = () => {
    localStorage.removeItem('atlas2_userProfile');
    localStorage.removeItem('atlas2_workoutHistory');
    localStorage.removeItem('atlas2_workoutPlan');
    localStorage.removeItem('atlas2_nutritionPlan');
    localStorage.removeItem('atlas2_completedExercises');
    
    setUserProfile(null);
    setWorkoutPlan(null);
    setNutritionPlan(null);
    setWorkoutHistory([]);
  };
  
  const addWorkoutLog = (log: WorkoutLog) => {
    const updatedHistory = [...workoutHistory, log];
    setWorkoutHistory(updatedHistory);
    localStorage.setItem('atlas2_workoutHistory', JSON.stringify(updatedHistory));
  };


  if (!userProfile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Dashboard
      userProfile={userProfile}
      isSubscribed={isSubscribed}
      setIsSubscribed={setIsSubscribed}
      workoutPlan={workoutPlan}
      setWorkoutPlan={setWorkoutPlan}
      nutritionPlan={nutritionPlan}
      setNutritionPlan={setNutritionPlan}
      workoutHistory={workoutHistory}
      addWorkoutLog={addWorkoutLog}
      onLogout={handleLogout}
      onUpdateProfile={handleUpdateProfile}
      subscriptionPrice={subscriptionPrice}
      onUpdatePrice={handleUpdatePrice}
    />
  );
};

export default App;