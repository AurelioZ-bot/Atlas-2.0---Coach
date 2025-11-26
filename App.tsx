
import React, { useState, useEffect } from 'react';
import { UserProfile, WorkoutPlan, NutritionPlan, WorkoutLog, RegisteredUser } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true); 
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
  const [subscriptionPrice, setSubscriptionPrice] = useState<number>(17000);
  
  // New States for Payment Integration
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [adminPhone, setAdminPhone] = useState<string>('');

  // Load basic data
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('atlas2_userProfile');
      const savedHistory = localStorage.getItem('atlas2_workoutHistory');
      const savedPrice = localStorage.getItem('atlas2_subscriptionPrice');
      const savedPaymentLink = localStorage.getItem('atlas2_paymentLink');
      const savedAdminPhone = localStorage.getItem('atlas2_adminPhone');
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
      if (savedPaymentLink) {
        setPaymentLink(savedPaymentLink);
      }
      if (savedAdminPhone) {
        setAdminPhone(savedAdminPhone);
      }
      if (savedWorkoutPlan) {
        setWorkoutPlan(JSON.parse(savedWorkoutPlan));
      }
      if (savedNutritionPlan) {
        setNutritionPlan(JSON.parse(savedNutritionPlan));
      }
    } catch (error) {
      console.error("Failed to load data from local storage", error);
    }
  }, []);

  // Central Check for Subscription Status based on Registry
  useEffect(() => {
    if (userProfile?.phone) {
        const checkStatus = () => {
            try {
                const registryStr = localStorage.getItem('atlas2_userRegistry');
                const registry: RegisteredUser[] = registryStr ? JSON.parse(registryStr) : [];
                const userEntry = registry.find(u => u.phone === userProfile.phone);
                
                if (userEntry) {
                    setIsSubscribed(userEntry.isActive);
                } else {
                    // Fallback for new demo users who might be missed or if registry is cleared
                    setIsSubscribed(true); 
                }
            } catch (e) {
                console.error("Error checking subscription status", e);
            }
        };

        checkStatus();
        // Polling to update status if changed in Admin panel (since this is client-side only)
        const interval = setInterval(checkStatus, 2000); 
        return () => clearInterval(interval);
    }
  }, [userProfile?.phone]);

  // Save Plans Persistence
  useEffect(() => {
    if (workoutPlan) {
      localStorage.setItem('atlas2_workoutPlan', JSON.stringify(workoutPlan));
    }
  }, [workoutPlan]);

  useEffect(() => {
    if (nutritionPlan) {
      localStorage.setItem('atlas2_nutritionPlan', JSON.stringify(nutritionPlan));
    }
  }, [nutritionPlan]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('atlas2_userProfile', JSON.stringify(profile));
    
    // Register user in the "Database"
    if (profile.phone) {
        const registryStr = localStorage.getItem('atlas2_userRegistry');
        const registry: RegisteredUser[] = registryStr ? JSON.parse(registryStr) : [];
        
        // Check if exists
        const existingUser = registry.find(u => u.phone === profile.phone);
        
        if (!existingUser) {
            const newUser: RegisteredUser = {
                phone: profile.phone,
                name: profile.name,
                isActive: true, // Default to true for new users in demo
                registrationDate: new Date().toISOString()
            };
            registry.push(newUser);
            localStorage.setItem('atlas2_userRegistry', JSON.stringify(registry));
        }
    }
  };
  
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem('atlas2_userProfile', JSON.stringify(updatedProfile));
    
    // Update name in registry if changed
    if (updatedProfile.phone) {
        const registryStr = localStorage.getItem('atlas2_userRegistry');
        let registry: RegisteredUser[] = registryStr ? JSON.parse(registryStr) : [];
        const index = registry.findIndex(u => u.phone === updatedProfile.phone);
        if (index !== -1) {
            registry[index].name = updatedProfile.name;
            localStorage.setItem('atlas2_userRegistry', JSON.stringify(registry));
        }
    }

    setWorkoutPlan(null);
    setNutritionPlan(null);
    localStorage.removeItem('atlas2_workoutPlan');
    localStorage.removeItem('atlas2_nutritionPlan');
  };
  
  const handleUpdatePrice = (newPrice: number) => {
    setSubscriptionPrice(newPrice);
    localStorage.setItem('atlas2_subscriptionPrice', JSON.stringify(newPrice));
  };

  const handleUpdatePaymentLink = (link: string) => {
    setPaymentLink(link);
    localStorage.setItem('atlas2_paymentLink', link);
  };

  const handleUpdateAdminPhone = (phone: string) => {
    setAdminPhone(phone);
    localStorage.setItem('atlas2_adminPhone', phone);
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
      setIsSubscribed={setIsSubscribed} // This essentially becomes a refresh trigger
      workoutPlan={workoutPlan}
      setWorkoutPlan={setWorkoutPlan}
      nutritionPlan={nutritionPlan}
      setNutritionPlan={setNutritionPlan}
      workoutHistory={workoutHistory}
      addWorkoutLog={addWorkoutLog}
      onLogout={handleLogout}
      onUpdateProfile={handleUpdateProfile}
      // Admin Props
      subscriptionPrice={subscriptionPrice}
      onUpdatePrice={handleUpdatePrice}
      paymentLink={paymentLink}
      onUpdatePaymentLink={handleUpdatePaymentLink}
      adminPhone={adminPhone}
      onUpdateAdminPhone={handleUpdateAdminPhone}
    />
  );
};

export default App;
