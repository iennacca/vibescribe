
import React, { useState } from 'react';
import { AnalysisResult } from '../types';

interface ResultsProps {
  data: AnalysisResult;
}

export const Results: React.FC<ResultsProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = activeTab === 'summary' ? data.summary : data.transcript;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 gap-4">
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === 'summary' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Executive Summary
            {activeTab === 'summary' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('transcript')}
            className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === 'transcript' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Full Transcript
            {activeTab === 'transcript' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
          </button>
        </div>
        <div className="pb-4 flex gap-2">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
          <button className="flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'summary' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-6 bg-indigo-500 rounded-full" />
                  Overview
                </h3>
                <p className="text-slate-700 leading-relaxed text-lg italic">
                  "{data.summary}"
                </p>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-6 bg-emerald-500 rounded-full" />
                  Key Insights
                </h3>
                <ul className="space-y-4">
                  {data.keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-4 group">
                      <span className="flex-shrink-0 w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </span>
                      <p className="text-slate-700 pt-1 group-hover:text-slate-900 transition-colors">
                        {point}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="space-y-6">
              <section className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                <h3 className="text-md font-bold text-slate-300 mb-4 uppercase tracking-wider">
                  Action Items
                </h3>
                {data.actionItems.length > 0 ? (
                  <ul className="space-y-3">
                    {data.actionItems.map((item, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <div className="mt-1.5 w-4 h-4 border-2 border-indigo-400 rounded flex-shrink-0" />
                        <span className="text-sm font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 text-sm italic">No explicit action items detected.</p>
                )}
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">
                  Sentiment Analysis
                </h3>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${data.sentiment.toLowerCase().includes('positive') ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <span className="text-lg font-semibold text-slate-900">{data.sentiment}</span>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200">
              <div className="prose max-w-none text-slate-700 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {data.transcript}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
