import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';
import { Search as SearchIcon, MenuBook, Favorite, AccountCircle, Collections as CollectionsIcon } from '@mui/icons-material';

const Navigation: React.FC = () => {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Implement search functionality here
        console.log('Searching for:', searchQuery);
    };

    return (
        <nav className="navigation">
            <div className="nav-content">
                <div className="nav-left">
                    <Link to="/collections" className="nav-link">Collections</Link>
                </div>

                <div className="nav-right">
                    <form 
                        className={`search-container ${isSearchExpanded ? 'expanded' : ''}`}
                        onSubmit={handleSearch}
                        onMouseEnter={() => setIsSearchExpanded(true)}
                        onMouseLeave={() => {
                            if (!searchQuery) {
                                setIsSearchExpanded(false);
                            }
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="search-button">
                            <SearchIcon />
                        </button>
                    </form>
                    <Link to="/profile" className="nav-link">Profile</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
