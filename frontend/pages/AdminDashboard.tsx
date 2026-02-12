
import React, { useState } from 'react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STUDENTS' | 'TEACHERS' | 'CLASSES'>('OVERVIEW');

  const stats = [
    { label: 'Total Enrollment', value: '1,240', change: '+12%', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Total Staff', value: '84', change: '+2', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { label: 'Avg Attendance', value: '94.2%', change: '+1.4%', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: 'Active Classes', value: '42', change: 'Stable', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  ];

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administration Console</h1>
          <p className="text-slate-500">Global system overview and resource management</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <button className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New User
          </button>
        </div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Recent Users</h3>
              <div className="flex gap-2">
                {['ALL', 'STUDENTS', 'TEACHERS'].map(t => (
                  <button key={t} className="px-3 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all uppercase">
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs font-bold text-slate-400 bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4">USER</th>
                    <th className="px-6 py-4">ROLE</th>
                    <th className="px-6 py-4">JOIN DATE</th>
                    <th className="px-6 py-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {[
                    { name: 'Alice Thompson', email: 'alice@edu.com', role: 'STUDENT', date: 'Oct 12, 2024' },
                    { name: 'Dr. Robert King', email: 'r.king@edu.com', role: 'TEACHER', date: 'Oct 10, 2024' },
                    { name: 'Sam Wilson', email: 'sam.w@edu.com', role: 'STUDENT', date: 'Oct 09, 2024' },
                    { name: 'Prof. Helen Mirren', email: 'helen@edu.com', role: 'TEACHER', date: 'Oct 08, 2024' },
                  ].map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.role === 'TEACHER' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{u.date}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-slate-400 hover:text-emerald-600 transition-all">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-6">Class Assignment</h3>
            <div className="space-y-4">
              {[
                { name: 'CS-402', teacher: 'Dr. King', students: 32 },
                { name: 'MAT-101', teacher: 'Prof. Mirren', students: 45 },
                { name: 'PHYS-202', teacher: 'Dr. King', students: 28 },
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <span className="text-xs text-slate-400 font-medium">{c.students} Students</span>
                  </div>
                  <p className="text-xs text-slate-500">Instructor: <span className="text-emerald-600 font-medium">{c.teacher}</span></p>
                </div>
              ))}
              <button className="w-full py-3 text-xs font-bold text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-all">
                MANAGE ALL CLASSES
              </button>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl shadow-sm bg-emerald-600 text-white">
            <h3 className="font-bold mb-2">System Health</h3>
            <p className="text-xs text-emerald-100 mb-6">AI Service & Database Status</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span>Face API Service</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Database Sync</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  Success
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>API Gateway</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  High Load
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
