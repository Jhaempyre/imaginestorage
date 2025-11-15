import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { useCreateApiKey, useApiKeyHistory, useRevokeApiKey } from '../../../api/api-keys';

const MIME_TYPES = [
  { value: 'image/jpeg', label: 'JPEG Images (.jpg, .jpeg)' },
  { value: 'image/png', label: 'PNG Images (.png)' },
  { value: 'image/gif', label: 'GIF Images (.gif)' },
  { value: 'image/webp', label: 'WebP Images (.webp)' },
  { value: 'video/mp4', label: 'MP4 Videos (.mp4)' },
  { value: 'video/avi', label: 'AVI Videos (.avi)' },
  { value: 'video/mov', label: 'MOV Videos (.mov)' },
  { value: 'application/pdf', label: 'PDF Documents (.pdf)' },
  { value: 'text/plain', label: 'Text Files (.txt)' },
  { value: 'application/zip', label: 'ZIP Archives (.zip)' },
  { value: 'application/json', label: 'JSON Files (.json)' },
  { value: 'text/csv', label: 'CSV Files (.csv)' },
];

export function DeveloperConsolePage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [maxFileSize, setMaxFileSize] = useState<string>('1');
  const [selectedMimeTypes, setSelectedMimeTypes] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // API hooks
  const createApiKeyMutation = useCreateApiKey();
  const { data: historyData, isLoading: isLoadingHistory } = useApiKeyHistory();
  const revokeApiKeyMutation = useRevokeApiKey();

  const generateApiKey = async () => {
    try {
      const response = await createApiKeyMutation.mutateAsync({
        maxFileSize: parseFloat(maxFileSize),
        allowedMimeTypes: selectedMimeTypes,
      });

      if (response.success) {
        // Log all options to console
        console.log('API Key Configuration:', {
          apiKey: response.data.key,
          maxFileSize: `${response.data.maxFileSize} GB`,
          allowedMimeTypes: response.data.allowedMimeTypes,
          allowedExtensions: response.data.allowedExtensions
        });
        
        setApiKey(response.data.key);
        setIsGenerated(true);
      }
    } catch (error) {
      console.error('Failed to generate API key:', error);
    }
  };

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      console.log('User copied the API key:', apiKey);
      setApiKey(null); // Hide the API key after copying
      setIsGenerated(false);
      setMaxFileSize('1');
      setSelectedMimeTypes([]);
    }
  };

  const handleRevokeApiKey = async (keyId: string) => {
    try {
      await revokeApiKeyMutation.mutateAsync(keyId);
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  const toggleMimeType = (mimeType: string) => {
    setSelectedMimeTypes(prev => 
      prev.includes(mimeType)
        ? prev.filter(type => type !== mimeType)
        : [...prev, mimeType]
    );
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold `bg-gradient-to-r` from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Hi Developer! 👨‍💻
            </h1>
            <p className="text-xl text-gray-600">
              Configure and generate your personalized API key
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full p-2 shadow-lg">
              <button
                onClick={() => setShowHistory(false)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                  !showHistory 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔑 Generate New Key
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                  showHistory 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 API Key History {historyData?.total && `(${historyData.total})`}
              </button>
            </div>
          </div>
        
          {/* Content */}
          {!showHistory ? (
            /* API Key Generation */
            !isGenerated ? (
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <div className="space-y-8">
                {/* Max File Size */}
                <div>
                  <Label htmlFor="maxFileSize" className="text-lg font-semibold text-gray-700 mb-3 block">
                    📁 Maximum File Size (GB)
                  </Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={maxFileSize}
                    onChange={(e) => setMaxFileSize(e.target.value)}
                    className="text-lg p-4 border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                    placeholder="Enter file size limit in GB"
                  />
                </div>

                {/* Allowed Mime Types */}
                <div>
                  <Label className="text-lg font-semibold text-gray-700 mb-3 block">
                    🎯 Allowed File Types
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto border-2 border-gray-200 rounded-lg p-4">
                    {MIME_TYPES.map((mimeType) => (
                      <div
                        key={mimeType.value}
                        onClick={() => toggleMimeType(mimeType.value)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          selectedMimeTypes.includes(mimeType.value)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedMimeTypes.includes(mimeType.value)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedMimeTypes.includes(mimeType.value) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-medium">{mimeType.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedMimeTypes.length > 0 && (
                    <p className="text-sm text-blue-600 mt-2">
                      ✅ {selectedMimeTypes.length} file type(s) selected
                    </p>
                  )}
                </div>

                {/* Generate Button */}
                <div className="text-center pt-6">
                  <Button 
                    onClick={generateApiKey}
                    disabled={selectedMimeTypes.length === 0 || createApiKeyMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {createApiKeyMutation.isPending ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      '🚀 Generate API Key'
                    )}
                  </Button>
                  {selectedMimeTypes.length === 0 && (
                    <p className="text-red-500 mt-2 text-sm">Please select at least one file type</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  🎉 API Key Generated Successfully!
                </h2>
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 mb-6">
                  <code className="text-lg font-mono text-green-400 break-all block">
                    {apiKey}
                  </code>
                </div>
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 font-semibold">
                    ⚠️ Important: Copy your API key now!
                  </p>
                  <p className="text-red-600 text-sm mt-1">
                    This key will disappear permanently after copying for security reasons.
                  </p>
                </div>
                <Button 
                  onClick={copyApiKey}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  📋 Copy API Key
                </Button>
              </div>
            </div>
            )
          ) : (
            /* API Key History */
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">🔐 API Key History</h2>
                <div className="text-sm text-gray-500">
                  {historyData?.total || 0} total keys
                </div>
              </div>

              {isLoadingHistory ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : historyData?.history?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔑</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No API Keys Yet</h3>
                  <p className="text-gray-600 mb-4">Generate your first API key to get started!</p>
                  <Button 
                    onClick={() => setShowHistory(false)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg"
                  >
                    Generate First Key
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {historyData?.history?.map((key, index) => (
                    <div
                      key={key.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-lg font-mono bg-gray-100 px-3 py-1 rounded-lg">
                              {key.maskedKey}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              key.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {key.isActive ? '✅ Active' : '❌ Revoked'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-semibold text-gray-700">Max Size:</span>
                              <span className="ml-2 text-gray-600">{key.maxFileSize} GB</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Usage:</span>
                              <span className="ml-2 text-gray-600">{key.usageCount} times</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Created:</span>
                              <span className="ml-2 text-gray-600">
                                {new Date(key.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <span className="font-semibold text-gray-700 text-sm">File Types:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {key.allowedMimeTypes.slice(0, 3).map((mimeType) => (
                                <span
                                  key={mimeType}
                                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                >
                                  {mimeType.split('/')[1].toUpperCase()}
                                </span>
                              ))}
                              {key.allowedMimeTypes.length > 3 && (
                                <span className="text-xs text-gray-500 px-2 py-1">
                                  +{key.allowedMimeTypes.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {key.isActive && (
                          <Button
                            onClick={() => handleRevokeApiKey(key.id)}
                            disabled={revokeApiKeyMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm rounded-lg ml-4"
                          >
                            {revokeApiKeyMutation.isPending ? 'Revoking...' : 'Revoke'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}