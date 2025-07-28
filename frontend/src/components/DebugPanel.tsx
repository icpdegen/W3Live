import React, { useState } from 'react';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { useUserProfile, useSaveUserProfile } from '../hooks/useQueries';
import { createActor } from '../backend';

export default function DebugPanel() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const { data: userProfile } = useUserProfile();
  const saveProfile = useSaveUserProfile();
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [testUsername, setTestUsername] = useState('testuser');

  const runDebugTests = async () => {
    let info = '=== Debug Tests ===\n\n';
    
    try {
      // Test 1: Check identity
      info += `1. Identity: ${identity ? '✅ Present' : '❌ Missing'}\n`;
      if (identity) {
        info += `   Principal: ${identity.getPrincipal().toString()}\n`;
      }
      
      // Test 2: Check actor
      info += `2. Actor: ${actor ? '✅ Available' : '❌ Not Available'}\n`;
      info += `   Actor Fetching: ${isFetching ? 'Yes' : 'No'}\n`;
      if (!actor) {
        info += `   Trying to create actor manually...\n`;
        try {
          const manualActor = await createActor({ 
            agentOptions: { identity } 
          });
          info += `   Manual actor creation: ${manualActor ? '✅ Success' : '❌ Failed'}\n`;
        } catch (error: any) {
          info += `   Manual actor creation failed: ${error.message}\n`;
        }
      }
      
      // Test 3: Test initializeAuth
      if (actor && identity) {
        try {
          info += `3. Testing initializeAuth...\n`;
          await actor.initializeAuth();
          info += `   ✅ initializeAuth completed\n`;
        } catch (error: any) {
          info += `   ❌ initializeAuth failed: ${error.message}\n`;
        }
      }
      
      // Test 4: Test getUserProfile
      if (actor) {
        try {
          info += `4. Testing getUserProfile...\n`;
          const profile = await actor.getUserProfile();
          info += `   Profile: ${profile ? JSON.stringify(profile) : 'null'}\n`;
        } catch (error: any) {
          info += `   ❌ getUserProfile failed: ${error.message}\n`;
        }
      }
      
      // Test 5: Test saveUserProfile
      if (actor) {
        try {
          info += `5. Testing saveUserProfile...\n`;
          await actor.saveUserProfile({ name: testUsername });
          info += `   ✅ saveUserProfile completed\n`;
        } catch (error: any) {
          info += `   ❌ saveUserProfile failed: ${error.message}\n`;
        }
      }
      
      // Test 6: Test createData
      if (actor) {
        try {
          info += `6. Testing createData...\n`;
          await actor.createData('test content', 'test:metadata');
          info += `   ✅ createData completed\n`;
        } catch (error: any) {
          info += `   ❌ createData failed: ${error.message}\n`;
        }
      }
      
      // Test 7: Test file upload
      if (actor) {
        try {
          info += `7. Testing file upload...\n`;
          const testData = new TextEncoder().encode('test file content');
          await actor.upload('test.txt', 'text/plain', testData, true);
          info += `   ✅ File upload completed\n`;
        } catch (error: any) {
          info += `   ❌ File upload failed: ${error.message}\n`;
        }
      }
      
    } catch (error: any) {
      info += `❌ Debug test failed: ${error.message}\n`;
    }
    
    setDebugInfo(info);
  };

  const clearDebugInfo = () => {
    setDebugInfo('');
  };

  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
      <h3 className="text-xl font-semibold text-white mb-4">Debug Panel</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <button
            onClick={runDebugTests}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Run Debug Tests
          </button>
          <button
            onClick={clearDebugInfo}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">
            Test Username
          </label>
          <input
            type="text"
            value={testUsername}
            onChange={(e) => setTestUsername(e.target.value)}
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        {debugInfo && (
          <div className="bg-black/30 rounded-lg p-4">
            <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono">
              {debugInfo}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 