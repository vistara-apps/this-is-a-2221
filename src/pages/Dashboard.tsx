import React, { useState } from 'react';
import { Plus, Search, Filter, BarChart3 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { SampleCard } from '../components/SampleCard';
import { PricingTable } from '../components/PricingTable';
import { Project, SubscriptionTier } from '../types';

export const Dashboard: React.FC = () => {
  const { user, projects, setCurrentProject, subscriptionTiers } = useApp();
  const [showPricing, setShowPricing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.trackName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.identifiedSourceTrack?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesFilter = filterStatus === 'all' || project.clearanceStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSelectTier = (tier: SubscriptionTier) => {
    alert(`Upgrading to ${tier.name} plan - This would integrate with Stripe in production`);
    setShowPricing(false);
  };

  const getUsageStats = () => {
    const currentTier = subscriptionTiers.find(t => t.name.toLowerCase() === user?.subscriptionTier);
    const searchesUsed = projects.length;
    const searchLimit = currentTier?.limits.searches === 'unlimited' ? '∞' : currentTier?.limits.searches || 0;
    
    return {
      searchesUsed,
      searchLimit,
      projectsCount: projects.length,
      clearanceRate: projects.length > 0 ? Math.round((projects.filter(p => p.clearanceStatus === 'cleared').length / projects.length) * 100) : 0
    };
  };

  const stats = getUsageStats();

  if (showPricing) {
    return (
      <div className="max-w-8xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-4">Choose Your Plan</h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Upgrade your subscription to unlock more features and get unlimited access to sample clearance tools.
          </p>
        </div>
        
        <PricingTable onSelectTier={handleSelectTier} />
        
        <div className="text-center mt-8">
          <button
            onClick={() => setShowPricing(false)}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
          <p className="text-text-secondary">
            Manage your sample clearance projects and track negotiations
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowPricing(true)}
            className="btn-secondary"
          >
            Upgrade Plan
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {stats.searchesUsed}/{stats.searchLimit}
              </p>
              <p className="text-sm text-text-secondary">Searches Used</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.projectsCount}</p>
              <p className="text-sm text-text-secondary">Total Projects</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.clearanceRate}%</p>
              <p className="text-sm text-text-secondary">Clearance Rate</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary capitalize">
                {user?.subscriptionTier || 'Free'}
              </p>
              <p className="text-sm text-text-secondary">Current Plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="identified">Identified</option>
          <option value="negotiating">Negotiating</option>
          <option value="cleared">Cleared</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
            </h3>
            <p className="text-text-secondary mb-6">
              {projects.length === 0 
                ? 'Start by uploading your first sample for identification and clearance.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {projects.length === 0 && (
              <button className="btn-primary">
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          filteredProjects.map((project) => (
            <SampleCard
              key={project.projectId}
              project={project}
              onClick={() => setCurrentProject(project)}
            />
          ))
        )}
      </div>
    </div>
  );
};