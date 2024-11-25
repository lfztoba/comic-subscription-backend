import React from 'react';
import { Link } from 'react-router-dom';
import { Comic } from '../types/comic';
import styles from './Collections.module.css';
import titleStyles from './CollectionTitle.module.css';
import './Collections.css';

interface CollectionRowProps {
    title: string;
    comics: Comic[];
}

interface CollectionsProps {
    comics: Comic[];
}

const CollectionRow: React.FC<CollectionRowProps> = ({ title, comics }) => {
    const titleClass = title.replace(/\s+/g, '_').toUpperCase();
    return (
        <div className="collection-row">
            <h2 className={`${titleStyles.collectionTitle} ${titleStyles[titleClass]}`}>
                {title}
            </h2>
            <div className="comics-slider">
                {comics.map((comic) => (
                    <Link 
                        to={`/comic/${comic.id}`} 
                        key={comic.id} 
                        style={{ textDecoration: 'none' }}
                    >
                        <div className={styles.collectionCard}>
                            <div className={styles.pagesContainer}>
                                {comic.pages.slice(0, 3).map((page, index) => (
                                    <img 
                                        key={index}
                                        src={page}
                                        alt={`Page ${index + 1}`}
                                        className={`${styles.pageCard} ${styles[`pageCard${index}`]}`}
                                    />
                                ))}
                            </div>
                            <div className={styles.comicInfo}>
                                <h3 className={styles.comicTitle}>{comic.title}</h3>
                                <p className={styles.comicStatus}>{comic.status}</p>
                                <div className={styles.comicRating}>
                                    {'★'.repeat(Math.floor(comic.rating))}
                                    {'☆'.repeat(5 - Math.floor(comic.rating))}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

const Collections: React.FC<CollectionsProps> = ({ comics }) => {
    // Define collections
    const collections = {
        'FAVORITES': comics.filter(comic => comic.isFavorite),
        'NEIGHBOR': comics.filter(comic => comic.collection === 'NEIGHBOR'),
        'MONSTRUM': comics.filter(comic => comic.collection === 'MONSTRUM'),
        'PROMISED PRINCESS': comics.filter(comic => comic.collection === 'PROMISED PRINCESS'),
        'AFTERMATH': comics.filter(comic => comic.collection === 'AFTERMATH'),
        'A SLICE OF MY LIFE': comics.filter(comic => comic.collection === 'A SLICE OF MY LIFE'),
        'LOOSE ENDS': comics.filter(comic => comic.collection === 'LOOSE ENDS'),
        'JALLY FANCOMIC': comics.filter(comic => comic.collection === 'JALLY FANCOMIC'),
        'SPIDEYPOOL': comics.filter(comic => comic.collection === 'SPIDEYPOOL'),
        'STEREK': comics.filter(comic => comic.collection === 'STEREK'),
        'VARIOUS OTHERS': comics.filter(comic => 
            ['MERTHUR', '00Q', 'DRARRY'].includes(comic.collection)
        ),
    };

    return (
        <div className="collections-container">
            {Object.entries(collections).map(([title, comicsList]) => (
                comicsList.length > 0 && (
                    <CollectionRow key={title} title={title} comics={comicsList} />
                )
            ))}
        </div>
    );
};

export default Collections;
