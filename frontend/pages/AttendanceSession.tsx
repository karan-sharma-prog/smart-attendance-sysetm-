
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
// Server-side face recognition service will handle verification.

interface AttendanceSessionProps {
  user: User;
}

const AttendanceSession: React.FC<AttendanceSessionProps> = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'IDLE' | 'QR' | 'FACE'>('IDLE');
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes session
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Fixed: Use any to avoid NodeJS.Timeout reference error in the browser environment
    let timer: any;
    if (mode !== 'IDLE' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [mode, timeLeft]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setStatus("Error: Camera permission denied");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCapturing(false);
  };

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setStatus('Verifying biometric identity...');
    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      const base64Data = imageData.split(',')[1];

      try {
        // Send image to local face-recognition service (Python Flask app)
        const resp = await fetch('http://localhost:5001/recognize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Data })
        });

        if (resp.ok) {
          const body = await resp.json();
          // If matches were returned, consider verification successful
          if (body.matches && body.matches.length > 0) {
            setStatus('Identity Verified! Marking attendance...');
            setTimeout(() => {
              setStatus('Attendance successfully marked for ' + user.name);
              stopCamera();
              setTimeout(() => navigate('/student'), 2000);
            }, 1500);
          } else {
            setStatus('Verification failed. Face not recognized.');
          }
        } else {
          const errBody = await resp.text();
          console.warn('Face service error:', resp.status, errBody);
          setStatus('Verification service error. Please try again.');
        }
      } catch (err) {
        console.error('Verification request failed', err);
        setStatus('Verification failed due to network error.');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Attendance Session</h1>
      </div>

      <div className="glass-card rounded-2xl p-12 text-center space-y-8 border-2 border-dashed border-emerald-100">
        {mode === 'IDLE' ? (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 2.944a11.955 11.955 0 01-8.618 3.04m17.236 0L21 14.122A11.951 11.951 0 0112 21.056a11.951 11.951 0 01-9-6.934L3 5.984m9-3.04c.046 0 .092 0 .138.001a11.953 11.953 0 019.236 3.04" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">Select Verification Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => { setMode('QR'); startCamera(); }}
                className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg">Scan QR Code</h3>
                <p className="text-sm text-slate-500 mt-2">Recommended for speed</p>
              </button>
              
              <button 
                onClick={() => { setMode('FACE'); startCamera(); }}
                className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg">Face Recognition</h3>
                <p className="text-sm text-slate-500 mt-2">Enhanced security & biometric</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl">
              <span className="font-semibold text-emerald-700">Verification in Progress</span>
              <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                Expiring in: {formatTime(timeLeft)}
              </span>
            </div>

            <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border-4 border-emerald-200">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Camera Overlays */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {mode === 'FACE' ? (
                  <div className="w-64 h-80 border-2 border-dashed border-emerald-400 rounded-[40%] flex items-center justify-center">
                    <div className="w-full h-1 bg-emerald-500/50 absolute animate-[scan_2s_infinite]" />
                  </div>
                ) : (
                    <div className="w-64 h-64 border-2 border-emerald-400 rounded-xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />
                  </div>
                )}
              </div>
            </div>

            <p className="text-lg font-medium text-slate-700">{status || `Align your ${mode === 'FACE' ? 'face within the frame' : 'QR code'}`}</p>
            
            <div className="flex gap-4 justify-center">
               <button 
                onClick={captureAndVerify}
                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all"
              >
                Mark Attendance
              </button>
              <button 
                onClick={() => { stopCamera(); setMode('IDLE'); setStatus(''); }}
                className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 10%; }
          100% { top: 90%; }
        }
      `}</style>
    </div>
  );
};

export default AttendanceSession;
