import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { roleHome } from '../../utils/rolePath';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    const u = await login(email, password);
    nav(roleHome(u.role));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
      <form onSubmit={onSubmit} className="bg-white shadow rounded p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-emerald-700 mb-4">Login</h1>
        <label className="block text-sm mb-1">Email</label>
        <input className="w-full border rounded p-2 mb-4" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label className="block text-sm mb-1">Password</label>
        <input type="password" className="w-full border rounded p-2 mb-4" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="w-full py-2 rounded bg-emerald-600 text-white">Login</button>
      </form>
    </div>
  );
}
