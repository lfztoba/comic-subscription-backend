import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, StarBorder, ArrowBack, Favorite, FavoriteBorder } from '@mui/icons-material';
import { comicService } from '../services/comicService';
import { Comic } from '../types/comic';
import { auth } from '../firebase';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../config/stripe';
import { PaymentForm } from './PaymentForm';
import './ComicDetail.css';

const ComicDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [comic, setComic] = useState<Comic | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isMonthlySubscription, setIsMonthlySubscription] = useState(false);

    useEffect(() => {
        const fetchComic = async () => {
            if (id) {
                const fetchedComic = await comicService.getComicById(id);
                setComic(fetchedComic);
                setLoading(false);
            }
        };
        fetchComic();
    }, [id]);

    const handleToggleFavorite = async () => {
        if (comic && auth.currentUser) {
            await comicService.toggleFavorite(comic.id, auth.currentUser.uid);
            setComic({ ...comic, isFavorite: !comic.isFavorite });
        }
    };

    const startReading = () => {
        if (comic) {
            navigate(`/reader/${comic.id}/chapter/${comic.chapters[0].number}`);
        }
    };

    if (loading) {
        return (
            <div className="comic-detail-loading">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="loading-spinner"
                />
            </div>
        );
    }

    if (!comic) {
        return <div className="comic-detail-error">Comic not found</div>;
    }

    return (
        <motion.div 
            className="comic-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.button
                className="back-button"
                onClick={() => navigate(-1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <ArrowBack />
            </motion.button>

            <div className="comic-detail-content">
                <motion.div 
                    className="comic-cover-section"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <img src={comic.cover} alt={comic.title} className="comic-cover" />
                    <motion.button
                        className="favorite-button"
                        onClick={handleToggleFavorite}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {comic.isFavorite ? <Favorite /> : <FavoriteBorder />}
                    </motion.button>
                </motion.div>

                <motion.div 
                    className="comic-info-section"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1>{comic.title}</h1>
                    <div className="comic-metadata">
                        <p className="author">By {comic.author}</p>
                        <div className="rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star}>
                                    {star <= comic.rating ? <Star /> : <StarBorder />}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="genre-tags">
                        {comic.genre.map((genre) => (
                            <span key={genre} className="genre-tag">{genre}</span>
                        ))}
                    </div>

                    <p className="description">{comic.description}</p>

                    <div className="purchase-options">
                        <motion.button
                            className="buy-button single"
                            onClick={() => {
                                setIsMonthlySubscription(false);
                                setShowPaymentModal(true);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Buy Single Chapter (${comic.price.toFixed(2)})
                        </motion.button>
                        <motion.button
                            className="buy-button subscription"
                            onClick={() => {
                                setIsMonthlySubscription(true);
                                setShowPaymentModal(true);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Subscribe Monthly (${comic.monthlyPrice?.toFixed(2) || (comic.price * 0.8).toFixed(2)}/month)
                        </motion.button>
                    </div>

                    {comic.id === "2" && (
                        <div className="stripe-button-container" style={{ width: '240px', margin: '20px auto' }}>
                            <stripe-buy-button
                                buy-button-id="buy_btn_1QOtI9Giqh3Xm6JDF2Fw9rca"
                                publishable-key="pk_live_51HLJZ4Giqh3Xm6JDcYHiajwYbXLaXMsXu9oPQuoDjkAqHPVF8yULb2OfzB6yTbPexr8BgTzqU3SY6NsMdZmyWPNJ00T6BeXmkA"
                            />
                        </div>
                    )}

                    {comic.id !== "2" && (
                        <motion.button
                            className="read-button"
                            onClick={startReading}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Start Reading
                        </motion.button>
                    )}

                    <div className="chapters-section">
                        <h2>Chapters</h2>
                        <div className="chapters-list">
                            {comic.chapters.map((chapter) => (
                                <motion.div
                                    key={chapter.id}
                                    className={`chapter-item ${chapter.readStatus}`}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => navigate(`/reader/${comic.id}/chapter/${chapter.number}`)}
                                >
                                    <span className="chapter-number">Chapter {chapter.number}</span>
                                    <span className="chapter-title">{chapter.title}</span>
                                    <span className={`read-status ${chapter.readStatus}`}>
                                        {chapter.readStatus}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {showPaymentModal && (
                    <Elements stripe={stripePromise}>
                        <PaymentForm
                            price={isMonthlySubscription ? (comic.monthlyPrice || comic.price * 0.8) : comic.price}
                            comicTitle={comic.title}
                            isMonthly={isMonthlySubscription}
                            onClose={() => setShowPaymentModal(false)}
                            onSuccess={() => {
                                setShowPaymentModal(false);
                                // You might want to update the UI or redirect after successful purchase
                            }}
                        />
                    </Elements>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ComicDetail;
