export interface Comic {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    cover: string;  // For backward compatibility
    pages: string[];  // Array of page image URLs
    author: string;
    genre: string[];
    rating: number;
    chapters: Chapter[];
    collection: string;  // Single collection the comic belongs to
    collections?: string[];  // Keeping this for backward compatibility
    releaseDate: string;
    status: 'ongoing' | 'completed';
    isFavorite: boolean;
    price: number;  // Price in USD
    isMonthly?: boolean;  // Whether the comic has a monthly subscription
    monthlyPrice?: number;  // Optional monthly subscription price
    totalPages?: number;  // Total number of pages
    monthlyPages?: number;  // Number of pages released monthly
    purchased?: boolean;
}

export interface Chapter {
    id: string;
    title: string;
    number: number;
    pages: Page[];
    readStatus: 'unread' | 'reading' | 'completed';
}

export interface Page {
    id: string;
    imageUrl: string;
    pageNumber: number;
}

export interface UserProgress {
    userId: string;
    comicId: string;
    currentChapter: number;
    currentPage: number;
    lastReadAt: Date;
}

export interface ComicFilters {
    genre?: string[];
    author?: string;
    status?: 'ongoing' | 'completed';
    rating?: number;
}

export interface Collection {
    id: string;
    name: string;
    description: string;
    comics: Comic[];
}
