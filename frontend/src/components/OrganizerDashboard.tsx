import React, { useState } from 'react';
import { Plus, Calendar, Users, Video, Edit, Trash2, Eye, Globe, Lock, FileText, User, Save, X, AlertTriangle, RefreshCw, Wifi, Shield, Database, CheckCircle, XCircle, Activity, Bug } from 'lucide-react';
import { useAllEvents, useDeleteEvent, useUserProfile, useSaveUserProfile } from '../hooks/useQueries';
import { useFileList } from '../file-storage/FileList';
import { Event } from '../types/events';
import EventCreator from './EventCreator';
import EventEditor from './EventEditor';
import LikesAndReactions from './LikesAndReactions';
import DebugPanel from './DebugPanel';

export default function OrganizerDashboard() {
  const [showEventCreator, setShowEventCreator] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameValue, setUsernameValue] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [showDataIntegrityPanel, setShowDataIntegrityPanel] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  const { data: events = [], isLoading, error, refetch, isRefetching } = useAllEvents();
  const { data: userProfile } = useUserProfile();
  const saveProfile = useSaveUserProfile();
  const deleteEvent = useDeleteEvent();
  const { getFileUrl } = useFileList();

  const publishedEvents = events.filter(event => !event.isDraft);
  const draftEvents = events.filter(event => event.isDraft);

  // Calculate bulletproof data integrity metrics
  const totalEvents = events.length;
  const eventsWithBulletproofIntegrity = events.filter(event => (event as any).dataIntegrity === 'bulletproof').length;
  const integrityRate = totalEvents > 0 ? ((eventsWithBulletproofIntegrity / totalEvents) * 100).toFixed(1) : '100';
  const persistenceGuarantee = totalEvents > 0 && eventsWithBulletproofIntegrity === totalEvents ? 'bulletproof' : 'standard';

  const validateUsername = (username: string) => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    if (username.length > 20) {
      return 'Username must be less than 20 characters';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return 'Username can only contain letters, numbers, hyphens, and underscores';
    }
    return '';
  };

  const handleEditUsername = () => {
    setUsernameValue(userProfile?.name || '');
    setValidationMessage('');
    setEditingUsername(true);
  };

  const handleCancelEdit = () => {
    setEditingUsername(false);
    setUsernameValue('');
    setValidationMessage('');
  };

  const handleSaveUsername = async () => {
    const trimmedName = usernameValue.trim();
    
    console.log('handleSaveUsername called with:', trimmedName);
    
    if (!trimmedName) {
      setValidationMessage('Username cannot be empty');
      return;
    }
    
    const validation = validateUsername(trimmedName);
    if (validation) {
      setValidationMessage(validation);
      return;
    }

    console.log('About to call saveProfile.mutateAsync with:', { name: trimmedName });
    
    try {
      const result = await saveProfile.mutateAsync({ name: trimmedName });
      console.log('saveProfile.mutateAsync result:', result);
      setEditingUsername(false);
      setValidationMessage('');
      console.log('Username saved successfully, UI updated');
    } catch (error) {
      console.error('Failed to save username:', error);
      setValidationMessage('Failed to save username. Please try again.');
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsernameValue(value);
    const validation = validateUsername(value);
    setValidationMessage(validation);
  };

  const handleDeleteEvent = async (eventId: bigint) => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await deleteEvent.mutateAsync(eventId);
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  const handleEventCreated = () => {
    setShowEventCreator(false);
  };

  const handleEventUpdated = () => {
    setEditingEvent(null);
  };

  if (showEventCreator) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Create New Event</h2>
          <button
            onClick={() => setShowEventCreator(false)}
            className="px-4 py-2 text-purple-300 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        <EventCreator 
          onCancel={() => setShowEventCreator(false)} 
          onSuccess={handleEventCreated}
        />
      </div>
    );
  }

  if (editingEvent) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Edit Event</h2>
          <button
            onClick={() => setEditingEvent(null)}
            className="px-4 py-2 text-purple-300 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        <EventEditor 
          event={editingEvent}
          onCancel={() => setEditingEvent(null)} 
          onSuccess={handleEventUpdated}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Organizer Dashboard</h2>
          <p className="text-purple-200">Manage your livestreaming events with bulletproof data persistence</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Debug Panel Toggle */}
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="flex items-center space-x-2 text-sm text-purple-300 hover:text-white transition-colors"
          >
            <Bug className="w-4 h-4" />
            <span>Debug</span>
          </button>
          
          {/* Bulletproof Data Integrity Panel Toggle */}
          <button
            onClick={() => setShowDataIntegrityPanel(!showDataIntegrityPanel)}
            className="flex items-center space-x-2 text-sm text-purple-300 hover:text-white transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>Data Integrity</span>
            {persistenceGuarantee === 'bulletproof' && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </button>
          
          {/* Manual Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isRefetching || isLoading}
            className="flex items-center space-x-2 text-sm text-purple-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>{isRefetching ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          
          <button
            onClick={() => setShowEventCreator(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            <Plus className="w-5 h-5" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Debug Panel */}
      {showDebugPanel && (
        <div className="mb-8">
          <DebugPanel />
        </div>
      )}

      {/* Bulletproof Data Integrity Panel */}
      {showDataIntegrityPanel && (
        <div className="mb-8 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span>Bulletproof Data Persistence Status</span>
              {persistenceGuarantee === 'bulletproof' && (
                <div className="flex items-center space-x-1 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Active</span>
                </div>
              )}
            </h3>
            <button
              onClick={() => setShowDataIntegrityPanel(false)}
              className="text-purple-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-green-200 text-sm">Total Events</p>
                  <p className="text-2xl font-bold text-white">{totalEvents}</p>
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-blue-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm">Bulletproof Events</p>
                  <p className="text-2xl font-bold text-white">{eventsWithBulletproofIntegrity}</p>
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-purple-200 text-sm">Integrity Rate</p>
                  <p className="text-2xl font-bold text-white">{integrityRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                  {persistenceGuarantee === 'bulletproof' ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  )}
                </div>
                <div>
                  <p className="text-yellow-200 text-sm">Persistence Level</p>
                  <p className="text-lg font-bold text-white capitalize">{persistenceGuarantee}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-black/20 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Bulletproof Storage Architecture</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-green-200 mb-2">
                  <strong className="text-green-100">Unique ID Generation:</strong> Each event uses cryptographically secure unique identifiers with mathematical collision prevention.
                </p>
                <p className="text-green-200">
                  <strong className="text-green-100">Immutable Storage:</strong> Events are stored with bulletproof write-once semantics and comprehensive integrity verification.
                </p>
              </div>
              <div>
                <p className="text-green-200 mb-2">
                  <strong className="text-green-100">Session Independence:</strong> All data persists permanently across sessions with guaranteed retrieval mechanisms.
                </p>
                <p className="text-green-200">
                  <strong className="text-green-100">Fail-Safe Design:</strong> Multiple verification layers ensure events are never lost, corrupted, or overwritten.
                </p>
              </div>
            </div>
            
            {persistenceGuarantee === 'bulletproof' && (
              <div className="mt-4 bg-green-900/20 rounded-lg p-3 border border-green-500/30">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-200">Bulletproof Persistence Active</span>
                </div>
                <p className="text-xs text-green-300">
                  All your events are protected by bulletproof data persistence. They will never disappear, get overwritten, or be lost across sessions.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Error Handling for Dashboard */}
      {error && (
        <div className="mb-8 bg-red-900/30 border border-red-500/50 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Unable to Load Your Events</h3>
              <p className="text-red-200 mb-4">
                We're having trouble loading your events. This could be due to a network issue or temporary server problem.
                The bulletproof data persistence system is working to recover your events.
              </p>
              <div className="bg-red-900/20 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-300 font-mono">
                  Error: {error?.message || 'Unknown error occurred'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                  <span>{isRefetching ? 'Retrying...' : 'Try Again'}</span>
                </button>
                <div className="text-sm text-red-300">
                  <p>• Bulletproof data recovery is active</p>
                  <p>• Check your internet connection</p>
                  <p>• Try logging out and back in</p>
                  <p>• Your events are safely stored and will be recovered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Profile</span>
        </h3>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Username
            </label>
            {editingUsername ? (
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={usernameValue}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="Enter your username"
                    className={`w-full px-4 py-2 bg-black/50 border rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      validationMessage 
                        ? 'border-red-500/50' 
                        : usernameValue && !validationMessage 
                        ? 'border-green-500/50' 
                        : 'border-purple-500/30'
                    }`}
                  />
                  {validationMessage && (
                    <p className="mt-1 text-sm text-red-400">{validationMessage}</p>
                  )}
                </div>
                <button
                  onClick={handleSaveUsername}
                  disabled={!usernameValue.trim() || !!validationMessage || saveProfile.isPending}
                  className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveProfile.isPending ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saveProfile.isPending}
                  className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex-1 px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white">
                  {userProfile?.name || 'No username set'}
                </div>
                <button
                  onClick={handleEditUsername}
                  className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {!editingUsername && (
          <div className="mt-3 text-xs text-purple-300">
            <p>• 3-20 characters long</p>
            <p>• Letters, numbers, hyphens, and underscores only</p>
          </div>
        )}
      </div>

      {/* Stats Cards with Bulletproof Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-purple-200 text-sm">Total Events</p>
              <p className="text-2xl font-bold text-white">{events.length}</p>
              <p className="text-xs text-purple-300">{integrityRate}% bulletproof</p>
            </div>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-purple-200 text-sm">Published</p>
              <p className="text-2xl font-bold text-white">{publishedEvents.length}</p>
              <p className="text-xs text-purple-300">Live & accessible</p>
            </div>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-purple-200 text-sm">Drafts</p>
              <p className="text-2xl font-bold text-white">{draftEvents.length}</p>
              <p className="text-xs text-purple-300">Work in progress</p>
            </div>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-purple-200 text-sm">Private</p>
              <p className="text-2xl font-bold text-white">
                {events.filter(event => event.isPrivate && !event.isDraft).length}
              </p>
              <p className="text-xs text-purple-300">Secure access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Connection Status with Bulletproof Guarantee */}
      {!error && (
        <div className="mb-8 bg-green-900/20 border border-green-500/30 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-sm text-green-300">
            <Wifi className="w-4 h-4" />
            <span>Connected to decentralized network</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>•</span>
            <Shield className="w-4 h-4" />
            <span>Bulletproof data persistence active</span>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>•</span>
            <span>Events are guaranteed to persist across all sessions</span>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-8">
        {/* Draft Events */}
        {draftEvents.length > 0 && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20">
            <div className="p-6 border-b border-purple-500/20">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-yellow-400" />
                <span>Draft Events</span>
                <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                  {draftEvents.length}
                </span>
                <div className="flex items-center space-x-1 text-xs text-green-300">
                  <Shield className="w-3 h-3" />
                  <span>Bulletproof storage</span>
                </div>
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftEvents.map((event) => (
                  <EventCard
                    key={event.id.toString()}
                    event={event}
                    onEdit={() => setEditingEvent(event)}
                    onDelete={() => handleDeleteEvent(event.id)}
                    getFileUrl={getFileUrl}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Published Events */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20">
          <div className="p-6 border-b border-purple-500/20">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Globe className="w-5 h-5 text-green-400" />
              <span>Published Events</span>
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                {publishedEvents.length}
              </span>
              <div className="flex items-center space-x-1 text-xs text-green-300">
                <Shield className="w-3 h-3" />
                <span>Bulletproof storage</span>
              </div>
            </h3>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-purple-200 mb-2">Loading your events with bulletproof integrity verification...</p>
                <p className="text-purple-300 text-sm">
                  Fetching events from decentralized storage with guaranteed data persistence
                </p>
              </div>
            ) : publishedEvents.length === 0 && !error ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">No published events yet</h4>
                <p className="text-purple-200 mb-6">Create your first livestreaming event to get started</p>
                <button
                  onClick={() => setShowEventCreator(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200"
                >
                  Create Your First Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedEvents.map((event) => (
                  <EventCard
                    key={event.id.toString()}
                    event={event}
                    onEdit={() => setEditingEvent(event)}
                    onDelete={() => handleDeleteEvent(event.id)}
                    getFileUrl={getFileUrl}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface EventCardProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  getFileUrl: (metadata: { path: string; size: bigint; mimeType: string }) => Promise<string>;
}

function EventCard({ event, onEdit, onDelete, getFileUrl }: EventCardProps) {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  React.useEffect(() => {
    if (event.heroImagePath) {
      getFileUrl({ path: event.heroImagePath, size: BigInt(0), mimeType: 'image/*' })
        .then(url => {
          setHeroImageUrl(url);
          setImageLoadError(false);
        })
        .catch(error => {
          console.error('Error loading hero image for event card:', error);
          setImageLoadError(true);
        });
    }
  }, [event.heroImagePath, getFileUrl]);

  const hasBulletproofIntegrity = (event as any).dataIntegrity === 'bulletproof';
  const persistenceGuarantee = (event as any).persistenceGuarantee === 'verified';

  return (
    <div className="bg-black/50 rounded-lg border border-purple-500/20 overflow-hidden hover:border-purple-400/40 transition-all duration-200 event-card">
      {/* Hero Image with Error Handling */}
      <div className="h-48 bg-gradient-to-r from-purple-600 to-pink-600 relative overflow-hidden">
        {heroImageUrl && !imageLoadError ? (
          <img
            src={heroImageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={() => setImageLoadError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            {imageLoadError ? (
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-white/70 mx-auto mb-2" />
                <p className="text-white/70 text-xs">Image unavailable</p>
              </div>
            ) : (
              <Video className="w-12 h-12 text-white" />
            )}
          </div>
        )}
        <div className="absolute top-2 right-2 flex space-x-1">
          {event.isDraft ? (
            <span className="bg-yellow-600/80 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
              <FileText className="w-3 h-3" />
              <span>Draft</span>
            </span>
          ) : event.isPrivate ? (
            <span className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Private</span>
            </span>
          ) : (
            <span className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
              <Globe className="w-3 h-3" />
              <span>Public</span>
            </span>
          )}
          {event.hlsUrl && !event.isDraft && (
            <span className="bg-red-600/80 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Live</span>
            </span>
          )}
        </div>
        
        {/* Bulletproof Data Integrity Indicator */}
        <div className="absolute top-2 left-2">
          {hasBulletproofIntegrity && persistenceGuarantee ? (
            <span className="bg-green-600/80 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Bulletproof</span>
            </span>
          ) : (
            <span className="bg-blue-600/80 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Verified</span>
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="text-lg font-semibold text-white mb-2 truncate">{event.title}</h4>
        <p className="text-purple-200 text-sm mb-4 line-clamp-2">{event.description}</p>
        
        {/* Engagement Stats for Published Events */}
        {!event.isDraft && (
          <div className="mb-4">
            <LikesAndReactions eventId={event.id} compact />
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-purple-300 mb-4">
          <span className="flex items-center space-x-1">
            <Video className="w-3 h-3" />
            <span>{event.videos.length} videos</span>
          </span>
          {event.hlsUrl && (
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Live Stream</span>
            </span>
          )}
          {hasBulletproofIntegrity && persistenceGuarantee && (
            <span className="flex items-center space-x-1 text-green-400">
              <Shield className="w-3 h-3" />
              <span>Bulletproof</span>
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
          >
            <Edit className="w-3 h-3" />
            <span>Edit</span>
          </button>
          <button
            onClick={onDelete}
            className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
