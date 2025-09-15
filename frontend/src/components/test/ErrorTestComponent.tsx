import { useState } from 'react';
import { authApi } from '../../api/auth/api';
import { ErrorNormalizer } from '../../api/error';

/**
 * Test component to demonstrate error handling
 * This can be removed in production
 */
export function ErrorTestComponent() {
  const [loading, setLoading] = useState(false);

  const testNetworkError = async () => {
    setLoading(true);
    try {
      // This will fail and trigger network error handling
      await fetch('http://nonexistent-domain.com/api/test');
    } catch (error) {
      const normalized = ErrorNormalizer.normalize(error);
      console.log('Network error normalized:', normalized);
    } finally {
      setLoading(false);
    }
  };

  const testBackendError = async () => {
    setLoading(true);
    try {
      // This will trigger a 401 error and redirect to login
      await authApi.getCurrentUser();
    } catch (error) {
      console.log('Backend error caught:', error);
    } finally {
      setLoading(false);
    }
  };

  const testFrontendError = () => {
    // This will trigger a frontend runtime error
    throw new Error('Test frontend error');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Error Handling Test</h3>
      <div className="space-y-3">
        <button
          onClick={testNetworkError}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Network Error
        </button>
        
        <button
          onClick={testBackendError}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Test Backend Error (401)
        </button>
        
        <button
          onClick={testFrontendError}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Frontend Error
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Open browser console to see error handling in action.</p>
        <p>The 401 error should redirect you to login page.</p>
      </div>
    </div>
  );
}