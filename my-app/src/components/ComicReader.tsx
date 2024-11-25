import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoExpand, IoContract, IoArrowBack } from 'react-icons/io5';
import { MdNavigateBefore, MdNavigateNext, MdZoomIn, MdZoomOut } from 'react-icons/md';
import { TbLayoutColumns, TbLayoutRows } from 'react-icons/tb';
import { useSidebar } from '../contexts/SidebarContext';
import './ComicReader.css';
import { Comic } from '../types/comic';

interface ComicReaderProps {
  comic: Comic;
  onClose: () => void;
}

const ComicReader: React.FC<ComicReaderProps> = ({ comic, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isDoublePage, setIsDoublePage] = useState(false);
  const { setShowSidebar } = useSidebar();

  useEffect(() => {
    // Hide sidebar when reader opens
    setShowSidebar(false);
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        handleNextPage();
      } else if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === 'd') {
        toggleDoublePageView();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      // Show sidebar when reader closes
      setShowSidebar(true);
    };
  }, [currentPage, setShowSidebar]);

  const handleClose = () => {
    setShowSidebar(true);
    onClose();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const newPage = isDoublePage ? 
        Math.max(0, currentPage - 2) : 
        currentPage - 1;
      setCurrentPage(newPage);
      setZoom(1);
    }
  };

  const handleNextPage = () => {
    const maxPage = comic.pages.length - 1;
    if (currentPage < maxPage) {
      const newPage = isDoublePage ? 
        Math.min(maxPage - 1, currentPage + 2) : 
        currentPage + 1;
      setCurrentPage(newPage);
      setZoom(1);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const toggleDoublePageView = () => {
    setIsDoublePage(prev => {
      const newIsDouble = !prev;
      if (newIsDouble) {
        // When switching to double page, ensure we start from an even page
        setCurrentPage(Math.floor(currentPage / 2) * 2);
      }
      return newIsDouble;
    });
    setZoom(1);
  };

  const getPageSpread = () => {
    const pageIndex = currentPage;
    
    const firstPage = (
      <div className="page-container" key={`page-${pageIndex}`}>
        <img 
          src={comic.pages[pageIndex]} 
          alt={`Page ${pageIndex + 1}`} 
          className="comic-page"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>
    );

    const secondPage = isDoublePage && pageIndex + 1 < comic.pages.length && (
      <div className="page-container" key={`page-${pageIndex + 1}`}>
        <img 
          src={comic.pages[pageIndex + 1]} 
          alt={`Page ${pageIndex + 2}`} 
          className="comic-page"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>
    );

    return (
      <motion.div 
        key={`spread-${pageIndex}`} 
        className={`comic-page-wrapper ${isDoublePage ? 'double-page' : 'single-page'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {firstPage}
        {secondPage}
      </motion.div>
    );
  };

  return (
    <div className="comic-reader">
      <div className="reader-controls">
        <div className="reader-info">
          <h2 className="comic-title">{comic.title}</h2>
        </div>
        <div className="control-buttons">
          <button onClick={handleClose}>
            <IoClose size={24} />
          </button>
        </div>
      </div>
      
      <div className="reader-content">
        <div className="pages-container">
          <AnimatePresence mode="wait">
            <motion.div key={currentPage} className="page-spread">
              {getPageSpread()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="bottom-navigation-bar">
        <button 
          className="nav-button back-button"
          onClick={handleClose}
          title="Back to Details"
        >
          <IoArrowBack size={20} />
        </button>

        <div className="nav-group">
          <button
            className="nav-button prev"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            title="Previous Page"
          >
            <MdNavigateBefore size={24} />
          </button>
          
          <span className="page-counter">
            {isDoublePage ? (
              <>
                {currentPage + 1}
                {currentPage + 1 < comic.pages.length && 
                  `-${currentPage + 2}`}
              </>
            ) : (
              currentPage + 1
            )}
            {' / '}
            {comic.pages.length}
          </span>

          <button
            className="nav-button next"
            onClick={handleNextPage}
            disabled={currentPage >= comic.pages.length - (isDoublePage ? 1 : 0)}
            title="Next Page"
          >
            <MdNavigateNext size={24} />
          </button>
        </div>

        <div className="nav-group">
          <button 
            className="nav-button zoom"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            title="Zoom Out"
          >
            <MdZoomOut size={20} />
          </button>

          <span className="zoom-level">
            {Math.round(zoom * 100)}%
          </span>

          <button 
            className="nav-button zoom"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            title="Zoom In"
          >
            <MdZoomIn size={20} />
          </button>

          <button 
            className="nav-button view-mode"
            onClick={toggleDoublePageView}
            title={isDoublePage ? "Single Page View" : "Double Page View"}
          >
            {isDoublePage ? <TbLayoutRows size={20} /> : <TbLayoutColumns size={20} />}
          </button>

          <button 
            className="nav-button fullscreen"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <IoContract size={20} /> : <IoExpand size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComicReader;
