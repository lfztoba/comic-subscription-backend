import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Comic } from '../types/comic';
import ComicReader from './ComicReader';
import { ArrowBack, Favorite, FavoriteBorder, MenuBook, ShoppingCart } from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';
import './ComicDetails.css';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentForm } from './PaymentForm';
import './PaymentForm.css';
import { comicService } from '../services/comicService';

interface ComicDetailsProps {
  comics: Comic[];
  onUpdateComic: (comic: Comic) => void;
}

function ComicDetails({ comics, onUpdateComic }: ComicDetailsProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [isReading, setIsReading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const comic = comics.find(c => c.id === id);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setIsReading(searchParams.get('reading') === 'true');
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFavoriteClick = async () => {
    if (!user || !comic) {
      alert('Please sign in to favorite comics');
      return;
    }

    try {
      await comicService.toggleFavorite(comic.id, user.uid);
      const updatedComic: Comic = {
        ...comic,
        isFavorite: !comic.isFavorite
      };
      onUpdateComic(updatedComic);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update favorite status',
        severity: 'error'
      });
    }
  };

  const handlePurchaseClick = () => {
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentForm(false);
    if (comic && user) {
      try {
        await comicService.recordPurchase(user.uid, comic);
        setSnackbar({
          open: true,
          message: `Successfully purchased ${comic.title}!`,
          severity: 'success'
        });
        // Update the comic's purchased status in the UI
        const updatedComic = { ...comic, purchased: true };
        onUpdateComic(updatedComic);
      } catch (error) {
        console.error('Error recording purchase:', error);
        setSnackbar({
          open: true,
          message: 'Failed to record purchase. Please contact support.',
          severity: 'error'
        });
      }
    }
  };

  const handleReadClick = () => {
    if (!comic?.purchased) {
      setShowPaymentForm(true);
      return;
    }

    const newReadingState = !isReading;
    setIsReading(newReadingState);
    const searchParams = new URLSearchParams(window.location.search);
    if (newReadingState) {
      searchParams.set('reading', 'true');
    } else {
      searchParams.delete('reading');
    }
    navigate({ search: searchParams.toString() });
  };

  if (!comic) {
    return <div>Comic not found</div>;
  }

  if (isReading && comic.purchased) {
    return <ComicReader comic={comic} onClose={handleReadClick} />;
  }

  return (
    <div className="comic-details">
      <div className="comic-actions">
        <button className="action-button back-button" onClick={() => navigate('/collections')}>
          <ArrowBack /> Back
        </button>
        <button
          className="action-button favorite-button"
          onClick={handleFavoriteClick}
          disabled={!user}
        >
          {comic.isFavorite ? <Favorite /> : <FavoriteBorder />}
          {comic.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
        <button 
          className="action-button read-button" 
          onClick={handleReadClick}
        >
          {comic.purchased ? (
            <>
              <MenuBook />
              {isReading ? 'Close Reader' : 'Read Comic'}
            </>
          ) : (
            <>
              <ShoppingCart />
              Purchase for ${comic.price} {comic.isMonthly ? 'Monthly' : ''}
            </>
          )}
        </button>
      </div>

      <div className="purchase-section">
        <button
          className="purchase-button"
          onClick={handlePurchaseClick}
        >
          Purchase for ${comic.price.toFixed(2)}
        </button>
      </div>

      {showPaymentForm && (
        <PaymentForm
          price={comic.price}
          comicTitle={comic.title}
          isMonthly={comic.isMonthly}
          onClose={() => setShowPaymentForm(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div className="comic-content">
        <img 
          src={comic.pages[0]} 
          alt={`${comic.title} cover`}
          className="comic-thumbnail"
        />
        
        <div className="comic-info">
          <h1 className="comic-title">{comic.title}</h1>
          
          <div className="comic-metadata">
            <div className="metadata-item">
              <div className="metadata-label">Author</div>
              <div className="metadata-value">{comic.author}</div>
            </div>
            
            <div className="metadata-item">
              <div className="metadata-label">Status</div>
              <div className="metadata-value">{comic.status}</div>
            </div>

            <div className="metadata-item">
              <div className="metadata-label">Pages</div>
              <div className="metadata-value">
                {comic.totalPages || comic.pages.length} pages
                {comic.isMonthly && ' (Monthly Updates)'}
              </div>
            </div>

            <div className="metadata-item">
              <div className="metadata-label">Price</div>
              <div className="metadata-value">
                ${comic.price} USD
                {comic.isMonthly && ' monthly'}
              </div>
            </div>

            <div className="metadata-item">
              <div className="metadata-label">Rating</div>
              <div className="metadata-value">
                {'★'.repeat(Math.floor(comic.rating))}
                {'☆'.repeat(5 - Math.floor(comic.rating))}
                {' '}({comic.rating})
              </div>
            </div>

            <div className="metadata-item">
              <div className="metadata-label">Genre</div>
              <div className="metadata-value">{comic.genre.join(', ')}</div>
            </div>
          </div>

          <p className="comic-description">{comic.description}</p>
        </div>
      </div>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ComicDetails;
