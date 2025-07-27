import { useInternetIdentity } from 'ic-use-internet-identity';
import { useState, useEffect } from 'react';
import { useActor } from './hooks/useActor';
import LoginButton from './components/LoginButton';
import OrganizerDashboard from './components/OrganizerDashboard';
import PublicEventView from './components/PublicEventView';
import { Heart } from 'lucide-react';

function App() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const [currentView, setCurrentView] = useState<'dashboard' | 'public'>('public');

  const isAuthenticated = !!identity;
  const isOrganizer = isAuthenticated;

  // Default to public view for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentView('public');
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                W3Live
              </h1>
              <span className="text-purple-300 text-sm">Web3 Livestreaming Platform</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <button
                  onClick={() => setCurrentView('public')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'public'
                      ? 'bg-purple-600 text-white'
                      : 'text-purple-300 hover:text-white hover:bg-purple-600/50'
                  }`}
                >
                  Events
                </button>
                {isOrganizer && (
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentView === 'dashboard'
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-300 hover:text-white hover:bg-purple-600/50'
                    }`}
                  >
                    My Dashboard
                  </button>
                )}
              </nav>
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && isOrganizer ? (
          <OrganizerDashboard />
        ) : (
          <PublicEventView />
        )}

        {/* Welcome message for non-authenticated users */}
        {!isAuthenticated && currentView === 'public' && (
          <div className="mt-16 text-center">
            <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
              <h3 className="text-2xl font-semibold text-white mb-4">Become an Event Organizer</h3>
              <p className="text-purple-200 mb-6">
                Login with Internet Identity to create and manage your own livestreaming events on the decentralized web.
              </p>
              <LoginButton />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-purple-500/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-purple-300">
            © 2025. Built with <Heart className="inline w-4 h-4 text-pink-400" /> using{' '}
            <a 
              href="https://caffeine.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
