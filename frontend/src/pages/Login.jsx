import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="flex justify-center mb-6">
          <img
            src="https://via.placeholder.com/100?text=College+Logo"
            alt="College Logo"
            className="h-16 w-16 rounded-full"
          />
        </div>
        <h1 className="text-3xl font-bold text-white text-center mb-6 font-poppins">Welcome Back</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-white/80 font-inter">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-2 w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-5">
            <label htmlFor="password" className="block text-sm font-medium text-white/80 font-inter">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-2 w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="mb-5 text-red-300 text-center animate-fade-in">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300"
          >
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-white/60 font-inter">
          Authorized personnel only
        </p>
      </div>
    </div>
  );
};

export default Login;