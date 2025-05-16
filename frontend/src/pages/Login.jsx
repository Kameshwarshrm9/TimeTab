import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import gcetLogo from '../assets/gcet logo.jpg';
import gcetBackground from '../assets/gcet background.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${gcetBackground})`,
      }}
    >
      {/* Overlay with blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>

      {/* Login Form */}
      <div className="w-full max-w-md bg-white border border-gray-300 rounded-xl p-8 shadow-lg relative z-10">
        <div className="flex flex-col items-center mb-6">
          <img
            src={gcetLogo}
            alt="GCET Logo"
            className="h-16 w-16 rounded-full mb-3 border border-gray-300"
          />
          <h1 className="text-xl font-semibold text-gray-800">College Portal Login</h1>
          <p className="text-sm text-gray-500 mt-1">Access the official timetable system</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          For authorized college staff only
        </p>
      </div>
    </div>
  );
};

export default Login;