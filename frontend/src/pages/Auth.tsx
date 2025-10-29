import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      setLoading(true);
      await login(loginData.email, loginData.password);
      showToast('Login successful!', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      showToast(error.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (signupData.name.length < 3) {
      showToast('Name must be at least 3 characters', 'error');
      return;
    }

    if (signupData.password.length < 5) {
      showToast('Password must be at least 5 characters', 'error');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      setLoading(true);
      await signup(signupData.name, signupData.email, signupData.password);
      showToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      showToast(error.message || 'Signup failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements - Hide on mobile */}
      <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-orange-400 rounded-bl-full opacity-80"></div>
      <div className="hidden md:block absolute bottom-0 left-0 w-96 h-96 bg-yellow-400 rounded-tr-full"></div>
      
      <div className="relative w-full max-w-5xl shadow-2xl rounded-3xl overflow-hidden bg-white" style={{ minHeight: '600px' }}>
        
        {/* Container with both forms */}
        <div className="flex flex-col md:flex-row w-full h-full">
          
          {/* Forms Container - Show only one at a time on mobile */}
          <div className={`w-full md:w-1/2 bg-white p-6 md:p-12 flex flex-col justify-center relative z-10 ${!isLogin ? 'hidden md:flex' : ''}`}>
            {/* Login Form */}
            <div className="mb-8">
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-gray-700">SlotSwapper</span>
              </div>
              <h2 className="text-3xl font-bold text-teal-500 mb-6">Sign in to SlotSwapper</h2>
              
              <p className="text-sm text-gray-500 mb-6">Use your email account:</p>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
                  required
                />
              </div>
              
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-500 transition"
                >
                  {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              <div className="text-right">
                <button type="button" className="text-sm text-gray-600 hover:text-teal-500 transition">
                  Forgot your password?
                </button>
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-teal-500 text-white py-3 rounded-full font-semibold hover:bg-teal-600 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>
            </form>
          </div>

          <div className={`w-full md:w-1/2 bg-white p-6 md:p-12 flex flex-col justify-center relative z-10 ${isLogin ? 'hidden md:flex' : ''}`}>
            {/* Signup Form */}
            <div className="mb-8">
              <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-gray-700">SlotSwapper</span>
              </div>
              <h2 className="text-3xl font-bold text-teal-500 mb-6">Create Account</h2>
              <p className="text-sm text-gray-500 mb-6">Use your email for registration:</p>
            </div>
            
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <input 
                type="text" 
                placeholder="Name" 
                value={signupData.name}
                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition" 
                required
                minLength={3}
              />
              <input 
                type="email" 
                placeholder="Email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition" 
                required
              />
              <div className="relative">
                <input 
                  type={showSignupPassword ? 'text' : 'password'}
                  placeholder="Password" 
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition" 
                  required
                  minLength={5}
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-500 transition"
                >
                  {showSignupPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password" 
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition" 
                  required
                  minLength={5}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-500 transition"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-teal-500 text-white py-3 rounded-full font-semibold hover:bg-teal-600 transition shadow-lg hover:shadow-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
              </button>
            </form>
          </div>

        </div>

        {/* Sliding Panel - Different behavior on mobile */}
        <div className={`hidden md:block absolute top-0 w-1/2 h-full bg-gradient-to-br from-teal-400 to-teal-500 transition-all duration-700 ease-in-out flex items-center justify-center p-12 z-20 ${
          isLogin ? 'left-1/2' : 'left-0'
        }`}>
          <div className="text-center text-white">
            {isLogin ? (
              <>
                <h2 className="text-4xl font-bold mb-4">Create Your Account</h2>
                <p className="mb-8 text-lg">Enter your information to get started and explore</p>
                <button 
                  onClick={() => setIsLogin(false)}
                  className="px-12 py-3 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-teal-500 transition"
                >
                  SIGN UP
                </button>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
                <p className="mb-8 text-lg">Log in to access your account and continue where you left off.</p>
                <button 
                  onClick={() => setIsLogin(true)}
                  className="px-12 py-3 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-teal-500 transition"
                >
                  SIGN IN
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <div className="md:hidden absolute bottom-8 left-0 right-0 flex justify-center z-30">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="bg-teal-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg"
          >
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </div>

      </div>
    </div>
  );
}