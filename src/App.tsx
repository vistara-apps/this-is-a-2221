import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { SampleIdentification } from './pages/SampleIdentification';
import { ProjectDetail } from './pages/ProjectDetail';
import { AppProvider, useApp } from './contexts/AppContext';
import { Music, Upload, Search, MessageSquare, FileText } from 'lucide-react';

type Page = 'dashboard' | 'sample-identification' | 'project-detail';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { currentProject } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'sample-identification':
        return <SampleIdentification />;
      case 'project-detail':
        return <ProjectDetail />;
      default:
        return <Dashboard />;
    }
  };

  // Show onboarding for new users
  const [showOnboarding, setShowOnboarding] = useState(true);

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-blue-600 to-purple-700 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center text-white mb-12">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4">SampleFlow</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Clear sample rights, faster. Focus on your music, not the paperwork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Upload className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Upload & Identify</h3>
              <p className="text-sm text-blue-100">
                Upload your sample and instantly identify the original source
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Search className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Risk Assessment</h3>
              <p className="text-sm text-blue-100">
                Get instant risk scores and clearance difficulty estimates
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <MessageSquare className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Negotiate</h3>
              <p className="text-sm text-blue-100">
                Streamlined tools for contacting and negotiating with rights holders
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <FileText className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Document</h3>
              <p className="text-sm text-blue-100">
                Complete documentation trail for legal protection
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowOnboarding(false)}
              className="bg-white text-primary px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      
      {/* Navigation */}
      <div className="bg-surface border-b border-gray-200 px-6 py-2">
        <div className="max-w-8xl mx-auto flex space-x-6">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              currentPage === 'dashboard' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentPage('sample-identification')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              currentPage === 'sample-identification' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Identify Sample
          </button>
          {currentProject && (
            <button
              onClick={() => setCurrentPage('project-detail')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                currentPage === 'project-detail' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Current Project
            </button>
          )}
        </div>
      </div>

      <main className="animate-fade-in">
        {renderPage()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;