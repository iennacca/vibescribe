
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Uploader } from './components/Uploader';
import { Results } from './components/Results';
import { ProcessingStatus, AnalysisResult, ProcessingStep } from './types';
import { processMedia } from './services/geminiService';

const INITIAL_STEPS: ProcessingStep[] = [
  { id: 'read', label: 'Reading and preparing media file', status: 'pending' },
  { id: 'upload', label: 'Uploading data to Gemini AI', status: 'pending' },
  { id: 'analyze', label: 'AI Transcription and Analysis', status: 'pending' },
  { id: 'finalize', label: 'Generating executive report', status: 'pending' },
];

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeFile, setActiveFile] = useState<{ name: string; size: number } | null>(null);
  const [steps, setSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);

  const updateStep = (id: string, newStatus: ProcessingStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, status: newStatus } : step
    ));
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Failed to read file from disk."));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      setError("File size exceeds 100MB limit.");
      return;
    }

    try {
      setResult(null);
      setError(null);
      setActiveFile({ name: file.name, size: file.size });
      setSteps(INITIAL_STEPS.map(s => ({ ...s, status: 'pending' })));
      setStatus(ProcessingStatus.UPLOADING);

      // Step 1: Read File
      updateStep('read', 'active');
      const base64 = await readFileAsBase64(file);
      updateStep('read', 'completed');

      // Step 2: Sending to AI
      updateStep('upload', 'active');
      setStatus(ProcessingStatus.TRANSCRIBING);
      
      // We simulate the split between upload and analyze for UI purposes 
      // as the SDK does this in one go.
      setTimeout(() => updateStep('upload', 'completed'), 1000);
      
      // Step 3: Analysis
      updateStep('analyze', 'active');
      const analysis = await processMedia(base64, file.type);
      updateStep('analyze', 'completed');

      // Step 4: Finalize
      updateStep('finalize', 'active');
      setStatus(ProcessingStatus.SUMMARIZING);
      // Brief delay to show finalizing state
      await new Promise(r => setTimeout(r, 800));
      updateStep('finalize', 'completed');
      
      setResult(analysis);
      setStatus(ProcessingStatus.COMPLETED);
    } catch (err: any) {
      console.error("Processing error:", err);
      setError(err.message || "An unexpected error occurred.");
      setStatus(ProcessingStatus.ERROR);
      // Mark active step as error
      setSteps(prev => prev.map(s => s.status === 'active' ? { ...s, status: 'error' } : s));
    }
  };

  const handleUrlSubmit = async (url: string) => {
    setError("URL processing is currently restricted. Please upload a local file.");
    setStatus(ProcessingStatus.ERROR);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isProcessing = status !== ProcessingStatus.IDLE && status !== ProcessingStatus.COMPLETED && status !== ProcessingStatus.ERROR;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-12 pb-24">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-6xl">
            Vibe<span className="text-indigo-600">Scribe</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Intelligent media analysis. Get transcripts, summaries, and actionable insights in minutes.
          </p>
        </div>

        <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <Uploader 
            onFileSelect={handleFileSelect} 
            onUrlSubmit={handleUrlSubmit} 
            status={status} 
          />

          {isProcessing && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
              <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 animate-bounce">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Processing Media</h3>
                  <p className="text-slate-500 font-medium">{activeFile?.name} ({formatSize(activeFile?.size || 0)})</p>
                </div>

                <div className="space-y-4">
                  {steps.map((step, idx) => (
                    <div key={step.id} className="flex items-center gap-4 group">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${
                        step.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 
                        step.status === 'active' ? 'bg-indigo-100 text-indigo-600' : 
                        step.status === 'error' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-300'
                      }`}>
                        {step.status === 'completed' ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        ) : step.status === 'active' ? (
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                        ) : step.status === 'error' ? (
                          <span className="font-bold text-xs">!</span>
                        ) : (
                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                        )}
                      </div>
                      <span className={`text-sm font-semibold transition-colors duration-300 ${
                        step.status === 'active' ? 'text-indigo-600' : 
                        step.status === 'completed' ? 'text-slate-900' : 
                        step.status === 'error' ? 'text-red-600' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="relative pt-4">
                  <div className="overflow-hidden h-1 text-xs flex rounded bg-slate-100">
                    <div 
                      style={{ width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-700 ease-in-out"
                    />
                  </div>
                </div>
                
                <p className="text-center text-xs text-slate-400 font-medium">
                  Large files may take up to 2 minutes to analyze.
                </p>
              </div>
            </div>
          )}

          {status === ProcessingStatus.ERROR && error && (
            <div className="mt-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-3xl flex items-start gap-4 animate-in zoom-in-95 duration-300">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-grow pt-1">
                <h4 className="font-bold text-red-900 text-lg">Something went wrong</h4>
                <p className="text-sm opacity-90 mb-4">{error}</p>
                <button 
                  onClick={() => { setStatus(ProcessingStatus.IDLE); setSteps(INITIAL_STEPS); }} 
                  className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
                >
                  Reset & Try Again
                </button>
              </div>
            </div>
          )}
        </section>

        {result && (
          <section className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-2 h-10 bg-indigo-600 rounded-full" />
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900">Intelligence Report</h2>
                  <p className="text-slate-500 font-medium">Generated for {activeFile?.name}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setResult(null);
                  setStatus(ProcessingStatus.IDLE);
                  setActiveFile(null);
                  setSteps(INITIAL_STEPS);
                }}
                className="group flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
              >
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                New Analysis
              </button>
            </div>
            
            <Results data={result} />
          </section>
        )}
      </div>
    </Layout>
  );
};

export default App;
