import React from 'react';
import { motion } from 'framer-motion';
import './ComicGrid.css';
import { Favorite, FavoriteBorder } from '@mui/icons-material';

interface Comic {
    id: string;
    title: string;
    cover: string;
    author: string;
    isFavorite: boolean;
}

const ComicGrid: React.FC = () => {
    // Mock data - replace with real data from your backend
    const comics: Comic[] = [
        {
            id: '1',
            title: 'Spider-Man: No Way Home',
            cover: 'https://via.placeholder.com/300x450',
            author: 'Stan Lee',
            isFavorite: false
        },
        {
            id: '2',
            title: 'Batman: The Dark Knight',
            cover: 'https://via.placeholder.com/300x450',
            author: 'Frank Miller',
            isFavorite: true
        },
        // Add more comics here
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div 
            className="comic-grid"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {comics.map((comic) => (
                <motion.div 
                    key={comic.id} 
                    className="comic-card"
                    variants={item}
                    whileHover={{ 
                        scale: 1.05,
                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                    }}
                >
                    <div className="comic-cover">
                        <img src={comic.cover} alt={comic.title} />
                        <motion.button 
                            className="favorite-btn"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {comic.isFavorite ? (
                                <Favorite className="favorite-icon active" />
                            ) : (
                                <FavoriteBorder className="favorite-icon" />
                            )}
                        </motion.button>
                    </div>
                    <div className="comic-info">
                        <h3>{comic.title}</h3>
                        <p>{comic.author}</p>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default ComicGrid;
