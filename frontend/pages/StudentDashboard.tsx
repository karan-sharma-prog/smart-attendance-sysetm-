
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboard } from '../src/api';
import { toast } from 'react-hot-toast';

interface StudentDashboardProps {
  user: User;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await dashboard.getStudent();
        setData(data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;
  if (!data) return <div className="p-8">Error loading data.</div>;

  // Transform backend history for chart if needed, or use as is
  // Mock chart data based on percentage for visual, since history in response is just list
  const attendanceHistory = [
    { date: 'Oct 01', present: 1 },
    { date: 'Oct 02', present: 1 },
    { date: 'Oct 03', present: 0 },
    { date: 'Oct 04', present: 1 },
    { date: 'Oct 05', present: 1 },
    { date: 'Oct 08', present: 1 },
    { date: 'Oct 09', present: 1 },
  ];

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Student Hub</h1>
        <p className="text-slate-500">Academic summary for {user.name}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Quick Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl shadow-sm text-center">
            <h3 className="text-slate-500 text-sm font-medium mb-4">Overall Attendance</h3>
            <div className="relative inline-flex items-center justify-center p-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * (data.attendancePercentage || 0) / 100)} className={`${(data.attendancePercentage || 0) < 75 ? 'text-red-500' : 'text-emerald-600'} transition-all duration-1000`} />
              </svg>
              <span className="absolute text-2xl font-bold text-slate-900">{data.attendancePercentage}%</span>
            </div>
            {(data.attendancePercentage || 0) < 75 && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 font-medium">
                ⚠️ Low attendance warning! Maintain at least 75% to appear for exams.
              </div>
            )}
          </div>

          <div className="glass-card p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Upcoming Classes</h3>
            <div className="space-y-4">
              {data.upcomingClasses.map((cls: any) => (
                <div key={cls.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-900">{cls.name}</h4>
                      <p className="text-xs text-slate-500">{cls.teacher}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">{cls.time}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-white rounded border border-slate-200 text-slate-500">{cls.room}</span>
                    <button className="text-xs font-bold text-emerald-600 hover:underline">RESOURCES →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: History & Visuals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold mb-6">Attendance Activity</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceHistory}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="present" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card rounded-2xl shadow-sm overflow-hidden border border-slate-100">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Recent Records</h3>
              <button className="text-xs font-bold text-emerald-600">VIEW ALL</button>
            </div>
            <table className="w-full text-left">
              <thead className="text-xs font-bold text-slate-500 bg-slate-50/50">
                <tr>
                  <th className="px-6 py-3">SUBJECT</th>
                  <th className="px-6 py-3">DATE</th>
                  <th className="px-6 py-3">METHOD</th>
                  <th className="px-6 py-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50">
                {data.history.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4 font-medium text-slate-900">{row.sub}</td>
                    <td className="px-6 py-4 text-slate-500">{row.date}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">{row.method}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
