import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Music2, AlertCircle, User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // 1. Google Login
  const handleGoogleLogin = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Check if user doc exists, if not create it
      const userDocRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          bio: "Music lover.",
          language: 'en',
          createdAt: serverTimestamp()
        });
      }
      navigate('/feed');
    } catch (err: any) {
      console.error("Login failed", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("Domain not authorized for Google. Please use Email/Password or Guest Mode.");
      } else {
        setError("Google login failed. Please try again.");
      }
    }
  };

  // 2. Email/Password Auth (Register & Login)
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation for password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        // --- REGISTER ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Generate a cool avatar based on name
        const photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&size=128`;

        // Update Auth Profile
        await updateProfile(user, {
          displayName: displayName,
          photoURL: photoURL
        });

        // Create Firestore Document
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: displayName,
          email: user.email,
          photoURL: photoURL,
          bio: "Just joined U-Fi!",
          language: 'en',
          createdAt: serverTimestamp()
        });

      } else {
        // --- LOGIN ---
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      navigate('/feed');
    } catch (err: any) {
      console.error("Auth error", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Email already in use. Please login.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password.");
      } else if (err.code === 'auth/user-not-found') {
        setError("No account found with this email.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Guest Login
  const handleGuestLogin = async () => {
    setError(null);
    try {
      await signInAnonymously(auth);
      navigate('/feed');
    } catch (err: any) {
      setError("Guest login failed.");
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

      <div className="flex w-full max-w-4xl bg-dark-light/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10 min-h-[600px]">
        
        {/* Left Side - Visuals (Hidden on Mobile) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary/20 to-secondary/20 items-center justify-center p-12 relative">
          <div className="absolute inset-0 bg-noise opacity-10"></div>
          <div className="text-center relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/30">
              <Music2 className="text-white w-10 h-10" />
            </div>
            <h2 className="text-4xl font-black italic text-white mb-4">U-Fi.</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Connect with artists.<br/>Share your sound.<br/>Experience the future.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isRegistering ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-gray-400">
              {isRegistering ? "Join the community today." : "Enter your details to sign in."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegistering && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  {isRegistering ? "Sign Up" : "Sign In"}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
              <button 
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
                className="text-primary font-bold hover:underline transition-colors"
              >
                {isRegistering ? "Log In" : "Register"}
              </button>
            </p>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-500 bg-[#151e32]">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleLogin}
              className="bg-white text-gray-900 font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-100 transition-colors"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span>Google</span>
            </button>
            <button
              onClick={handleGuestLogin}
              className="bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <User size={18} />
              <span>Guest</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;