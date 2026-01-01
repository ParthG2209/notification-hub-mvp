import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';
import {
  Grid,
  Apple,
  AtSign,
  ChevronLeft,
  Github,
  Moon,
  Sun,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

export function AuthPage() {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithGithub, signInWithPassword, signUpWithPassword } = useAuth();
  const toast = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast.success('Redirecting to Google...');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = () => {
    toast.info('Apple Sign-In coming soon!');
  };

  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      await signInWithGithub();
      toast.success('Redirecting to GitHub...');
    } catch (error) {
      console.error('GitHub login error:', error);
      toast.error(error.message || 'Failed to sign in with GitHub');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isLogin) {
      // Signup validation
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    try {
      setLoading(true);
      
      if (isLogin) {
        // Login
        await signInWithPassword(email, password);
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      } else {
        // Signup
        await signUpWithPassword(email, password);
        toast.success('Account created! Please check your email to verify.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setIsLogin(true);
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.message || `Failed to ${isLogin ? 'login' : 'sign up'}`);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      {/* Theme Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-7 right-5 z-50"
        onClick={toggleTheme}
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <div className="bg-muted/60 relative hidden h-full flex-col border-r p-10 lg:flex">
        <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
        <div className="z-10 flex items-center gap-2">
          <Grid className="size-6" />
          <p className="text-xl font-semibold">Notification Hub</p>
        </div>
        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl">
              
            </p>
            <footer className="font-mono text-sm font-semibold">
              
            </footer>
          </blockquote>
        </div>
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      <div className="relative flex min-h-screen flex-col justify-center p-4">
        <div
          aria-hidden
          className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsl(var(--foreground)/0.06)_0,hsla(0,0%,55%,.02)_50%,hsl(var(--foreground)/0.01)_80%)] absolute top-0 right-0 h-[80rem] w-[35rem] -translate-y-[21.875rem] rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,hsl(var(--foreground)/0.04)_0,hsl(var(--foreground)/0.01)_80%,transparent_100%)] absolute top-0 right-0 h-[80rem] w-[15rem] [translate:5%_-50%] rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,hsl(var(--foreground)/0.04)_0,hsl(var(--foreground)/0.01)_80%,transparent_100%)] absolute top-0 right-0 h-[80rem] w-[15rem] -translate-y-[21.875rem] rounded-full" />
        </div>

        <Button variant="ghost" className="absolute top-7 left-5" asChild>
          <a href="/">
            <ChevronLeft className="size-4 me-2" />
            Home
          </a>
        </Button>

        <div className="mx-auto space-y-4 sm:w-[28rem]">
          <div className="flex items-center gap-2 lg:hidden">
            <Grid className="size-6" />
            <p className="text-xl font-semibold">Notification Hub</p>
          </div>

          {/* Login/Signup Toggle */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => setIsLogin(true)}
                className={`text-2xl font-bold tracking-wide transition-colors ${
                  isLogin ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                Login
              </button>
              <span className="text-muted-foreground">|</span>
              <button
                onClick={() => setIsLogin(false)}
                className={`text-2xl font-bold tracking-wide transition-colors ${
                  !isLogin ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>
            <p className="text-muted-foreground text-base">
              {isLogin 
                ? 'Welcome back! Login to your account.' 
                : 'Create a new account to get started.'}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-2">
            <Button 
              type="button" 
              size="lg" 
              className="w-full" 
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-4 me-2 animate-spin" />
              ) : (
                <GoogleIcon className="size-4 me-2" />
              )}
              Continue with Google
            </Button>
            <Button 
              type="button" 
              size="lg" 
              className="w-full" 
              onClick={handleAppleLogin}
              disabled={loading}
            >
              <Apple className="size-4 me-2" />
              Continue with Apple
            </Button>
            <Button 
              type="button" 
              size="lg" 
              className="w-full" 
              onClick={handleGithubLogin}
              disabled={loading}
            >
              <Github className="size-4 me-2" />
              Continue with GitHub
            </Button>
          </div>

          <AuthSeparator />

          {/* Email/Password Form */}
          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative h-max">
                <Input
                  placeholder="your.email@example.com"
                  className="peer ps-9"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <AtSign className="size-4" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative h-max">
                <Input
                  placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
                  className="peer ps-9 pe-9"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <Lock className="size-4" aria-hidden="true" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground absolute inset-y-0 end-0 flex items-center justify-center pe-3 hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input (Signup Only) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative h-max">
                  <Input
                    placeholder="Confirm your password"
                    className="peer ps-9 pe-9"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                    <Lock className="size-4" aria-hidden="true" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-muted-foreground absolute inset-y-0 end-0 flex items-center justify-center pe-3 hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password (Login Only) */}
            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => toast.info('Password reset coming soon!')}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 me-2 animate-spin" />
                  <span>{isLogin ? 'Logging in...' : 'Creating account...'}</span>
                </>
              ) : (
                <span>{isLogin ? 'Login' : 'Create Account'}</span>
              )}
            </Button>
          </form>

          {/* Switch Mode */}
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={switchMode}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>

          <p className="text-muted-foreground mt-8 text-sm">
            By clicking continue, you agree to our{' '}
            <a
              href="#"
              className="hover:text-primary underline underline-offset-4"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="#"
              className="hover:text-primary underline underline-offset-4"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

function FloatingPaths({ position }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-slate-950 dark:text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </svg>
    </div>
  );
}

const GoogleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <g>
      <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
    </g>
  </svg>
);

const AuthSeparator = () => {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="bg-border h-px w-full" />
      <span className="text-muted-foreground px-2 text-xs">OR</span>
      <div className="bg-border h-px w-full" />
    </div>
  );
};