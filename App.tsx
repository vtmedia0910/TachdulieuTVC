import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { parseSceneJson, formatFieldContent } from './services/parserService';
import { GroupedData } from './types';
import Button from './components/Button';
import GeminiModal from './components/GeminiModal';

// Icons
const UploadIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const DownloadIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const CopyIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const SparklesIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const App: React.FC = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState<GroupedData | null>(null);
  const [availableKeys, setAvailableKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [isGeminiOpen, setIsGeminiOpen] = useState(false);
  const [geminiContext, setGeminiContext] = useState({ title: '', data: '' });

  const handleParse = () => {
    setError(null);
    if (!jsonInput.trim()) {
      setError("Please paste some JSON first.");
      return;
    }

    try {
      const { grouped, keys } = parseSceneJson(jsonInput);
      if (keys.length === 0) {
        setError("JSON parsed successfully, but no matching fields (master_prompts, audio, text) were found.");
        return;
      }
      setParsedData(grouped);
      setAvailableKeys(keys);
      setSelectedKeys(new Set(keys)); // Select all by default
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setParsedData(null);
    setAvailableKeys([]);
    setSelectedKeys(new Set());
    setError(null);
  };

  const toggleKey = (key: string) => {
    const newSet = new Set(selectedKeys);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setSelectedKeys(newSet);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Optional: Add a toast notification here
      alert("Copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const downloadTxt = (filename: string, text: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, filename);
  };

  const downloadAllZip = async () => {
    if (!parsedData) return;

    const zip = new JSZip();
    let hasFiles = false;

    selectedKeys.forEach(key => {
      const content = formatFieldContent(parsedData[key]);
      zip.file(`${key}.txt`, content);
      hasFiles = true;
    });

    if (!hasFiles) {
      alert("No fields selected to download.");
      return;
    }

    const blob = await zip.generateAsync({ type: "blob" });
    FileSaver.saveAs(blob, "scene_assets.zip");
  };

  const openGemini = (key: string, content: string) => {
    setGeminiContext({ title: key, data: content });
    setIsGeminiOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <div className="bg-blue-600 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
             </div>
             <div>
               <h1 className="text-xl font-bold text-gray-900 leading-tight">SceneJSON Pro</h1>
               <p className="text-xs text-gray-500">Parser & AI Asset Manager</p>
             </div>
          </div>
          {parsedData && (
             <Button variant="primary" onClick={downloadAllZip} icon={<DownloadIcon />}>
               Download All (ZIP)
             </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input & Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="font-semibold text-gray-700">JSON Input</h2>
                {jsonInput && <button onClick={handleClear} className="text-xs text-red-600 hover:text-red-800 font-medium">Clear</button>}
              </div>
              <div className="p-4">
                <textarea 
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-mono resize-none"
                  placeholder='Paste your Scene JSON array here...'
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                />
                {error && (
                  <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded border border-red-100">
                    {error}
                  </div>
                )}
                <div className="mt-4 flex space-x-2">
                   <Button onClick={handleParse} className="w-full" icon={<UploadIcon />}>
                     Parse Data
                   </Button>
                </div>
              </div>
            </div>

            {parsedData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-semibold text-gray-700">Field Filter</h2>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {availableKeys.map(key => (
                      <label key={key} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedKeys.has(key)}
                          onChange={() => toggleKey(key)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 font-medium truncate flex-1">{key}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {parsedData[key].length}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-8">
            {!parsedData ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-12 bg-gray-50 min-h-[400px]">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No data parsed yet</p>
                <p className="text-sm mt-1">Paste JSON on the left to get started.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {availableKeys.filter(k => selectedKeys.has(k)).length === 0 && (
                   <div className="text-center py-12 text-gray-500">
                     Select fields from the left to view content.
                   </div>
                )}
                
                {availableKeys.filter(k => selectedKeys.has(k)).map(key => {
                  const content = formatFieldContent(parsedData[key]);
                  
                  return (
                    <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
                      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                          <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide">{key.replace(/_/g, ' ')}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             onClick={() => copyToClipboard(content)}
                             title="Copy to clipboard"
                           >
                             <CopyIcon />
                           </Button>
                           <Button 
                             variant="secondary" 
                             size="sm" 
                             onClick={() => downloadTxt(`${key}.txt`, content)}
                             title="Download as TXT"
                           >
                             <DownloadIcon />
                           </Button>
                           <Button 
                             variant="ai" 
                             size="sm" 
                             onClick={() => openGemini(key, content)}
                             icon={<SparklesIcon />}
                           >
                             AI Analysis
                           </Button>
                        </div>
                      </div>
                      <div className="p-0">
                        <div className="bg-gray-50 overflow-x-auto max-h-80 custom-scrollbar">
                           <pre className="p-6 text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed">{content}</pre>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <GeminiModal 
        isOpen={isGeminiOpen}
        onClose={() => setIsGeminiOpen(false)}
        contextTitle={geminiContext.title}
        contextData={geminiContext.data}
      />
    </div>
  );
};

export default App;