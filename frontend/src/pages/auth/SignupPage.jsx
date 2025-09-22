import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { signup } from '../../api/authApi';
import { onlyLetters, isPhone, strongPassword } from '../../utils/validation';
import { Link, useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const [form, setForm] = useState({
    role: 'Customer',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    company: ''
  });

  const nav = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    // validations
    if (!onlyLetters(form.name)) {
      return Swal.fire({ icon: 'error', title: 'Name must contain only letters', toast: true, position: 'top' });
    }
    if (!isPhone(form.phone)) {
      return Swal.fire({ icon: 'error', title: 'Phone must be 07XXXXXXXX or +94XXXXXXXXX', toast: true, position: 'top' });
    }
    if (!strongPassword(form.password)) {
      return Swal.fire({ icon: 'error', title: 'Weak password', text: 'Password must have 8+ chars, 1 uppercase, 1 number, 1 special char', toast: true, position: 'top' });
    }
    if (form.password !== form.confirmPassword) {
      return Swal.fire({ icon: 'error', title: 'Passwords do not match', toast: true, position: 'top' });
    }

    try {
      const { data } = await signup(form);
      Swal.fire({ icon: 'success', title: data.message, toast: true, position: 'top' });
      nav('/login'); // redirect after success
    } catch (e) {
      Swal.fire({ icon: 'error', title: e.response?.data?.message || 'Signup failed', toast: true, position: 'top' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
      <form onSubmit={submit} className="bg-white shadow rounded p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-emerald-700 mb-4">Signup</h1>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Name</label>
            <input name="name" className="w-full border rounded p-2" value={form.name} onChange={change} required />
          </div>
          <div>
            <label className="text-sm">Email</label>
            <input type="email" name="email" className="w-full border rounded p-2" value={form.email} onChange={change} required />
          </div>
          <div>
            <label className="text-sm">Phone</label>
            <input name="phone" className="w-full border rounded p-2" value={form.phone} onChange={change} required />
          </div>
          <div>
            <label className="text-sm">Role</label>
            <select name="role" className="w-full border rounded p-2" value={form.role} onChange={change}>
              {['Admin','Collector','Supplier','Employee','Customer'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {form.role === 'Supplier' && (
            <div className="col-span-2">
              <label className="text-sm">Company (optional)</label>
              <input name="company" className="w-full border rounded p-2" value={form.company} onChange={change} />
            </div>
          )}
          <div>
            <label className="text-sm">Password</label>
            <input type="password" name="password" className="w-full border rounded p-2" value={form.password} onChange={change} required />
          </div>
          <div>
            <label className="text-sm">Confirm Password</label>
            <input type="password" name="confirmPassword" className="w-full border rounded p-2" value={form.confirmPassword} onChange={change} required />
          </div>
        </div>

        {/* Signup button */}
        <div className="mt-4">
          <button
            type="submit"
            className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            Signup
          </button>
        </div>

        {/* Link to login */}
        <p className="text-sm mt-3 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-700 underline">Login</Link>
        </p>
      </form>
    </div>
  );
}
