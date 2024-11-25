import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { motion } from 'framer-motion';
import './SignIn.css';

const SignIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            setError(error.message);
        }
    };

    return (
        <motion.div 
            className="comic-sign-in-container"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="comic-bubble">
                <h1>Welcome to Comic Library!</h1>
                <p>Your gateway to endless comic adventures</p>
            </div>

            <motion.div 
                className="form-container"
                animate={{ rotateY: isSignUp ? 180 : 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className={`form-side ${isSignUp ? 'back' : 'front'}`}>
                    <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
                    {error && <p className="error">{error}</p>}
                    <form onSubmit={isSignUp ? handleSignUp : handleEmailSignIn}>
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <motion.button 
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isSignUp ? 'Sign Up' : 'Sign In'}
                        </motion.button>
                    </form>
                    <motion.button 
                        className="google-btn"
                        onClick={handleGoogleSignIn}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Sign in with Google
                    </motion.button>
                    <p className="toggle-form">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button 
                            className="toggle-btn"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SignIn;
