import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Project, SubscriptionTier } from '../types';

interface AppContextType {
  user: User | null;
  projects: Project[];
  currentProject: Project | null;
  subscriptionTiers: SubscriptionTier[];
  setUser: (user: User | null) => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  setCurrentProject: (project: Project | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const mockSubscriptionTiers: SubscriptionTier[] = [
  {
    name: 'Free',
    price: 0,
    features: ['3 sample searches per month', 'Basic risk assessment', 'Community support'],
    limits: { searches: 3, projects: 5 }
  },
  {
    name: 'Pro',
    price: 29,
    features: ['Unlimited searches', 'Advanced analytics', 'Negotiation templates', 'Email support'],
    limits: { searches: 'unlimited', projects: 'unlimited' }
  },
  {
    name: 'Premium',
    price: 79,
    features: ['Everything in Pro', 'Priority support', 'Custom integrations', 'Phone support'],
    limits: { searches: 'unlimited', projects: 'unlimited' }
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    userId: '1',
    email: 'demo@sampleflow.com',
    subscriptionTier: 'free'
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const addProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => 
      prev.map(p => p.projectId === projectId ? { ...p, ...updates } : p)
    );
    if (currentProject?.projectId === projectId) {
      setCurrentProject(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      projects,
      currentProject,
      subscriptionTiers: mockSubscriptionTiers,
      setUser,
      addProject,
      updateProject,
      setCurrentProject
    }}>
      {children}
    </AppContext.Provider>
  );
};