import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { Comic } from './types/comic';
import './App.css';
import SignIn from './components/SignIn';
import Navigation from './components/Navigation';
import ComicGrid from './components/ComicGrid';
import Collections from './components/Collections';
import SocialSidebar from './components/SocialSidebar';
import NewsletterAdmin from './components/NewsletterAdmin';
import ComicDetails from './components/ComicDetails';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import { comicService } from './services/comicService';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe outside of the component
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '');

// Add console log to debug
console.log('Stripe Public Key:', process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// Configure Stripe Elements appearance
const stripeElementsOptions = {
  fonts: [
    {
      cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
    },
  ],
  appearance: {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#4caf50',
      colorBackground: '#ffffff',
      colorText: '#424770',
      colorDanger: '#ff4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '4px',
    },
  },
};

function AppContent() {
  const [user] = useAuthState(auth);
  const [collections, setCollections] = useState<Comic[]>([]);
  const { showSidebar } = useSidebar();

  useEffect(() => {
    const fetchComics = async () => {
      if (user) {
        const comics = await comicService.getAllComics(user.uid);
        setCollections(comics);
      }
    };
    fetchComics();
  }, [user]);

  const onUpdateComic = async (updatedComic: Comic) => {
    if (!user) return;

    try {
      if (updatedComic.purchased) {
        await comicService.purchaseComic(updatedComic.id, user.uid);
      }
      
      // Fetch the updated comic to ensure we have the latest state
      const refreshedComic = await comicService.getComicById(updatedComic.id, user.uid);
      if (refreshedComic) {
        setCollections(prevComics => 
          prevComics.map(comic => 
            comic.id === refreshedComic.id ? refreshedComic : comic
          )
        );
      }
    } catch (error) {
      console.error('Error updating comic:', error);
      alert('Failed to update comic. Please try again.');
    }
  };

  if (!user) {
    return <SignIn />;
  }

  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/collections" />} />
            <Route path="/collections" element={<Collections comics={collections} />} />
            <Route path="/comic/:id" element={<ComicDetails comics={collections} onUpdateComic={onUpdateComic} />} />
            <Route path="/library" element={<ComicGrid />} />
            <Route path="/favorites" element={<ComicGrid />} />
            <Route path="/categories" element={<div>Categories Coming Soon!</div>} />
            <Route path="/profile" element={
              <div className="profile-container">
                <h2>Welcome, {user.email}!</h2>
                <button onClick={() => auth.signOut()}>Sign Out</button>
              </div>
            } />
            <Route path="/admin/newsletter" element={<NewsletterAdmin />} />
          </Routes>
        </main>
        {showSidebar && <SocialSidebar />}
      </div>
    </Router>
  );
}

function App() {
  return (
    <SidebarProvider>
      <Elements stripe={stripePromise} options={stripeElementsOptions}>
        <AppContent />
      </Elements>
    </SidebarProvider>
  );
}

export default App;
