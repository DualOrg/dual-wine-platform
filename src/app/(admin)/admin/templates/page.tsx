'use client';

import { useState, useEffect } from "react";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/templates")
      .then((r: any) => r.json())
      .then((data: any) => { setTemplates(Array.isArray(data) ? data : data?.templates || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading templates...</div>;

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="h-16 flex items-center justify-between px-8 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Admin</span>
          <span className="material-symbols-outlined text-xs text-slate-600">chevron_right</span>
          <span className="text-emerald-400 font-semibold">Templates</span>
        </div>
      </header>

      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">DUAL Templates</h1>
          <p className="text-sm text-slate-400">{templates.length} templates on the DUAL network</p>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No templates found</div>
        ) : (
          <div className="space-y-4">
            {templates.map((template: any) => {
              const actions = template.actions || [];
              const properties = template.properties || [];
              return (
                <div key={template.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition">
                  <div className="p-5 border-b border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-emerald-400">description</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate">{template.name}</h3>
                        <code className="text-[10px] text-slate-500 font-mono">{template.id}</code>
                      </div>
                      <span className="text-xs text-slate-500">{new Date(template.createdAt).toLocaleDateString()}</span>
                    </div>
                    {template.description && (
                      <p className="text-sm text-slate-400 mt-2 line-clamp-2">{template.description}</p>
                    )}
                  </div>

                  {actions.length > 0 && (
                    <div className="p-5">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        {actions.map((action: any, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
                            <span className="material-symbols-outlined text-emerald-400" style={{fontSize: '14px'}}>bolt</span>
                            {action.name || action.type || 'action'}
                            {action.access?.type === 'public' && (
                              <span className="text-[9px] text-emerald-500 ml-1">public</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {properties.length > 0 && (
                    <div className="p-5 border-t border-slate-800">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Properties</h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {properties.map((prop: any, i: number) => (
                          <div key={i} className="bg-slate-800 rounded-lg p-2 border border-slate-700 text-xs text-slate-300">
                            <span className="font-semibold text-white">{prop.key || prop.name || `prop_${i}`}</span>
                            {prop.type && <code className="ml-2 text-slate-500">{prop.type}</code>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
