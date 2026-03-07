"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/api/workers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', 'true'); 
        router.push('/admin');
      } else {
        alert("Invalid Login Credentials!");
      }
    } catch (err) {
      alert("Server check karein, shayad band hai!");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
      <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl w-full max-w-md">
        <h1 className="text-4xl font-black text-blue-500 mb-2 text-center">EMS UP</h1>
        <p className="text-gray-500 text-center mb-10 text-xs font-bold uppercase tracking-widest">Admin Login</p>
        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="text" placeholder="Username" 
            className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-blue-600 p-5 rounded-2xl font-black uppercase text-sm">
            Login to Command Center
          </button>
        </form>
      </div>
    </div>
  );
}