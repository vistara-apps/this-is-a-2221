import React from 'react';
import { Music, User, Settings, Crown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const Navbar: React.FC = () => {
  const { user } = useApp();

  return (
    <nav className="bg-surface border-b border-gray-200 px-6 py-4">
      <div className="max-w-8xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">SampleFlow</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-text-secondary hover:text-text-primary transition-colors">
              Dashboard
            </button>
            <button className="text-text-secondary hover:text-text-primary transition-colors">
              Projects
            </button>
            <button className="text-text-secondary hover:text-text-primary transition-colors">
              Negotiations
            </button>
            <button className="text-text-secondary hover:text-text-primary transition-colors">
              Documentation
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2">
              {user.subscriptionTier !== 'free' && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-accent/10 rounded-md">
                  <Crown className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-accent capitalize">
                    {user.subscriptionTier}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <button className="p-2 text-text-secondary hover:text-text-primary transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          
          <button className="p-2 text-text-secondary hover:text-text-primary transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};
