
import React, { useState, useEffect } from 'react';
import { UserProfile, WorkoutPlan, NutritionPlan, WorkoutLog, DailyWorkout } from '../types';
import Home from './Home';
import Routine from './Routine';
import Nutrition from './Nutrition';
import Progress from './Progress';
import CoachChat from './CoachChat';
import Subscription from './Subscription';
import Profile from './Profile';
import Admin from './Admin';
import WorkoutLogger from './WorkoutLogger';
import { generatePlans } from '../services/geminiService';

type View = 'home' | 'routine' | 'nutrition' | 'progress' | 'chat' | 'subscription' | 'profile' | 'admin';

interface DashboardProps {
  userProfile: UserProfile;
  isSubscribed: boolean;
  setIsSubscribed: (status: boolean) => void;
  workoutPlan: WorkoutPlan | null;
  setWorkoutPlan: (plan: WorkoutPlan | null) => void;
  nutritionPlan: NutritionPlan | null;
  setNutritionPlan: (plan: NutritionPlan | null) => void;
  workoutHistory: WorkoutLog[];
  addWorkoutLog: (log: WorkoutLog) => void;
  onLogout: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
  // Admin & Subscription Props
  subscriptionPrice: number;
  onUpdatePrice: (price: number) => void;
  paymentLink: string;
  onUpdatePaymentLink: (link: string) => void;
  adminPhone: string;
  onUpdateAdminPhone: (phone: string) => void;
}

const NavIcon: React.FC<{ icon: React.ReactNode, text: string, isActive: boolean, onClick: () => void }> = ({ icon, text, isActive, onClick }) => (
  <button onClick={onClick} className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors ${isActive ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
    {icon}
    <span className="font-medium">{text}</span>
  </button>
);

const Dashboard: React.FC<DashboardProps> = (props) => {
  const [activeView, setActiveView] = useState<View>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loggingWorkout, setLoggingWorkout] = useState<DailyWorkout | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const { userProfile, workoutPlan, setWorkoutPlan, nutritionPlan, setNutritionPlan } = props;

  useEffect(() => {
    const fetchPlans = async () => {
      // Check if EITHER plan is missing to ensure we have a complete set
      if (userProfile && (!workoutPlan || !nutritionPlan)) {
        setIsLoadingPlans(true);
        setPlanError(null);
        try {
          const plans = await generatePlans(userProfile);
          setWorkoutPlan(plans.workoutPlan);
          setNutritionPlan(plans.nutritionPlan);
        } catch (err) {
          setPlanError('Hubo un error al generar tus planes. Por favor, intenta de nuevo más tarde.');
          console.error(err);
        } finally {
          setIsLoadingPlans(false);
        }
      }
    };

    fetchPlans();
  }, [userProfile, workoutPlan, nutritionPlan, setWorkoutPlan, setNutritionPlan]);

  const handleLogComplete = (log: WorkoutLog) => {
    props.addWorkoutLog(log);
    setLoggingWorkout(null);
  };

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <Home 
            userProfile={props.userProfile} 
            workoutPlan={props.workoutPlan}
            nutritionPlan={props.nutritionPlan}
            setLoggingWorkout={setLoggingWorkout}
            isLoading={isLoadingPlans}
            error={planError}
        />;
      case 'routine':
        return <Routine 
            workoutPlan={props.workoutPlan} 
            setWorkoutPlan={props.setWorkoutPlan}
            setLoggingWorkout={setLoggingWorkout} 
        />;
      case 'nutrition':
        return <Nutrition nutritionPlan={props.nutritionPlan} />;
      case 'progress':
        return <Progress workoutHistory={props.workoutHistory} />;
      case 'chat':
        return <CoachChat 
            isSubscribed={props.isSubscribed}
            userProfile={props.userProfile}
            setWorkoutPlan={props.setWorkoutPlan}
            setNutritionPlan={props.setNutritionPlan}
          />;
      case 'subscription':
        return <Subscription 
            isSubscribed={props.isSubscribed} 
            userProfile={props.userProfile}
            subscriptionPrice={props.subscriptionPrice} 
            paymentLink={props.paymentLink}
            adminPhone={props.adminPhone}
        />;
      case 'profile':
        return <Profile userProfile={props.userProfile} onUpdateProfile={props.onUpdateProfile} />;
      case 'admin':
        return <Admin 
            subscriptionPrice={props.subscriptionPrice} 
            onUpdatePrice={props.onUpdatePrice}
            paymentLink={props.paymentLink}
            onUpdatePaymentLink={props.onUpdatePaymentLink}
            adminPhone={props.adminPhone}
            onUpdateAdminPhone={props.onUpdateAdminPhone}
        />;
      default:
        return <Home 
            userProfile={props.userProfile} 
            workoutPlan={props.workoutPlan}
            nutritionPlan={props.nutritionPlan}
            setLoggingWorkout={setLoggingWorkout}
            isLoading={isLoadingPlans}
            error={planError}
        />;
    }
  };

  const navItems = [
    { id: 'home', text: 'Inicio', icon: <HomeIcon /> },
    { id: 'routine', text: 'Mi Rutina', icon: <DumbbellIcon /> },
    { id: 'nutrition', text: 'Plan Nutricional', icon: <AppleIcon /> },
    { id: 'progress', text: 'Mi Progreso', icon: <ChartIcon /> },
    { id: 'chat', text: 'Chat con Coach', icon: <ChatIcon /> },
    { id: 'profile', text: 'Mi Perfil', icon: <UserIcon /> },
    { id: 'subscription', text: 'Suscripción', icon: <CreditCardIcon /> },
    { id: 'admin', text: 'Admin', icon: <ShieldIcon /> },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white w-64 fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-30`}>
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-cyan-400">Atlas 2.0</h1>
          <p className="text-sm text-gray-400">Hola, {props.userProfile.name}</p>
        </div>
        <nav className="p-5 flex-grow">
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.id}>
                <NavIcon 
                  icon={item.icon} 
                  text={item.text} 
                  isActive={activeView === item.id} 
                  onClick={() => {
                    setActiveView(item.id as View);
                    setIsSidebarOpen(false);
                  }} 
                />
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-5 border-t border-gray-700">
          <button onClick={props.onLogout} className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-red-500 hover:text-white transition-colors">
            <LogoutIcon />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 min-w-0">
        <button className="md:hidden p-2 text-white fixed top-4 left-4 z-40 bg-gray-800 rounded-md" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <MenuIcon />
        </button>
        {renderView()}
      </main>
      
      {loggingWorkout && (
        <WorkoutLogger 
            dailyWorkout={loggingWorkout}
            onLogComplete={handleLogComplete}
            onCancel={() => setLoggingWorkout(null)}
        />
      )}
    </div>
  );
};

// SVG Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const DumbbellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-6.364-8.626l-1.414 1.414a1 1 0 000 1.414l5.657 5.657a1 1 0 001.414 0l1.414-1.414M12 6.253l5.657-5.657a1 1 0 011.414 0l1.414 1.414a1 1 0 010 1.414l-5.657 5.657M12 6.253L6.343 12m11.314 0L12 17.657" /></svg>;
const AppleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18a6 6 0 006-6h-6V6a6 6 0 10-6 6h6v6zM12 6V3m0 3a3 3 0 00-3 3H6a6 6 0 006 6v-3a3 3 0 003-3h3a6 6 0 00-6-6z" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118 0c0-3.642-.424-7.14-1.182-10.434z" /></svg>;

export default Dashboard;
