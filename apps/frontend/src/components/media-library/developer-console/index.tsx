import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

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

  const generateApiKey = () => {
    // Generate a random 30-character string
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 30; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Log all options to console
    console.log('API Key Configuration:', {
      apiKey: result,
      maxFileSize: `${maxFileSize} GB`,
      allowedMimeTypes: selectedMimeTypes,
      allowedExtensions: selectedMimeTypes.map(mime => {
        const type = MIME_TYPES.find(t => t.value === mime);
        return type ? type.label.match(/\(([^)]+)\)/)?.[1] : mime;
      }).filter(Boolean)
    });
    
    setApiKey(result);
    setIsGenerated(true);
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Hi Developer! 👨‍💻
            </h1>
            <p className="text-xl text-gray-600">
              Configure and generate your personalized API key
            </p>
          </div>
        
          {!isGenerated ? (
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
                    disabled={selectedMimeTypes.length === 0}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    🚀 Generate API Key
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
          )}
        </div>
      </div>
    </div>
  );
}