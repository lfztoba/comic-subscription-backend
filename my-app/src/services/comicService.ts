import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { auth } from '../firebase';
import { Comic, UserProgress, ComicFilters } from '../types/comic';

interface Purchase {
  comicId: string;
  purchaseDate: Date;
  price: number;
  isMonthly: boolean;
  subscriptionStatus?: 'active' | 'cancelled';
  nextBillingDate?: Date;
}

interface PurchaseHistoryItem {
  comicId: string;
  purchaseDate: string;
  price?: number;
  isMonthly?: boolean;
}

class ComicService {
  private db = getFirestore();
  private initialComics: Comic[] = [
    {
      id: "loose-ends-1",
      title: "Comic Part 1",
      coverImage: "https://via.placeholder.com/300x450",
      cover: "https://via.placeholder.com/300x450",
      description: "Part 1 of the Loose Ends series",
      pages: [
        "https://res.cloudinary.com/dbnffni4r/image/upload/v1732159295/prrccjjfqht6gkjqyg8f.png",
        "https://res.cloudinary.com/dbnffni4r/image/upload/v1732159295/q8fg8hlhmr08lwginsdt.png",
        "https://res.cloudinary.com/dbnffni4r/image/upload/v1732159294/dzbrazaa4fzf9bvskdld.png"
      ],
      author: "Author Name",
      genre: ["Drama", "Romance"],
      rating: 4.5,
      chapters: [],
      collection: "LOOSE ENDS",
      releaseDate: "2023-01-01",
      status: "completed",
      isFavorite: false,
      price: 0.01,
      totalPages: 203,
      purchased: false
    },
    {
      id: "loose-ends-2",
      title: "Comic Part 2",
      coverImage: "https://via.placeholder.com/300x450",
      cover: "https://via.placeholder.com/300x450",
      description: "Part 2 of the Loose Ends series - Monthly Updates",
      pages: [
        "https://m.media-amazon.com/images/I/81s8xJUzWGL._AC_UF1000,1000_QL80_.jpg",
        "https://m.media-amazon.com/images/I/81s8xJUzWGL._AC_UF1000,1000_QL80_.jpg",
        "https://m.media-amazon.com/images/I/81s8xJUzWGL._AC_UF1000,1000_QL80_.jpg"
      ],
      author: "Author Name",
      genre: ["Drama", "Romance"],
      rating: 4.5,
      chapters: [],
      collection: "LOOSE ENDS",
      releaseDate: "2024-01-01",
      status: "ongoing",
      isFavorite: false,
      price: 5,
      isMonthly: true,
      totalPages: 39,
      monthlyPages: 39,
      purchased: false
    },
    {
      id: "1",
      title: "One Piece",
      coverImage: "https://m.media-amazon.com/images/I/81s8xJUzWGL._AC_UF1000,1000_QL80_.jpg",
      cover: "https://m.media-amazon.com/images/I/81s8xJUzWGL._AC_UF1000,1000_QL80_.jpg",
      description: "Follow Monkey D. Luffy and his swashbuckling crew in their search for the ultimate treasure, One Piece.",
      pages: [
        "https://m.media-amazon.com/images/I/81s8xJUzWGL._AC_UF1000,1000_QL80_.jpg",
        "https://m.media-amazon.com/images/I/81s8xJUzWGL._AC_UF1000,1000_QL80_.jpg",
        "https://m.media-amazon.com/images/I/81s8xJUzWGL._AC_UF1000,1000_QL80_.jpg"
      ],
      author: "Eiichiro Oda",
      genre: ["Action", "Adventure", "Comedy"],
      rating: 4.9,
      chapters: [],
      collection: "NEIGHBOR",
      releaseDate: "1997-07-22",
      status: "ongoing",
      isFavorite: false,
      price: 0.01,
      purchased: false
    },
    {
      id: "2",
      title: "Naruto",
      coverImage: "https://m.media-amazon.com/images/M/MV5BZmQ5NGFiNWEtMmMyMC00MDdiLTg4YjktOGY5Yzc2MDUxMTE1XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg",
      cover: "https://m.media-amazon.com/images/M/MV5BZmQ5NGFiNWEtMmMyMC00MDdiLTg4YjktOGY5Yzc2MDUxMTE1XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg",
      description: "Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage, the village's leader and strongest ninja.",
      pages: [
        "https://m.media-amazon.com/images/M/MV5BZmQ5NGFiNWEtMmMyMC00MDdiLTg4YjktOGY5Yzc2MDUxMTE1XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg",
        "https://m.media-amazon.com/images/M/MV5BZmQ5NGFiNWEtMmMyMC00MDdiLTg4YjktOGY5Yzc2MDUxMTE1XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg",
        "https://m.media-amazon.com/images/M/MV5BZmQ5NGFiNWEtMmMyMC00MDdiLTg4YjktOGY5Yzc2MDUxMTE1XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg"
      ],
      author: "Masashi Kishimoto",
      genre: ["Action", "Adventure", "Fantasy"],
      rating: 4.7,
      chapters: [],
      collection: "MONSTRUM",
      releaseDate: "1999-09-21",
      status: "completed",
      isFavorite: false,
      price: 0.01,
      purchased: false
    },
    {
      id: "3",
      title: "Death Note",
      coverImage: "https://m.media-amazon.com/images/M/MV5BNjRiNmNjMmMtN2U2Yi00ODgxLTk3OTMtMmI1MTI1NjYyZTEzXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_FMjpg_UX1000_.jpg",
      cover: "https://m.media-amazon.com/images/M/MV5BNjRiNmNjMmMtN2U2Yi00ODgxLTk3OTMtMmI1MTI1NjYyZTEzXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_FMjpg_UX1000_.jpg",
      description: "An intelligent high school student goes on a secret crusade to eliminate criminals from the world after discovering a notebook capable of killing anyone whose name is written into it.",
      pages: [
        "https://m.media-amazon.com/images/M/MV5BNjRiNmNjMmMtN2U2Yi00ODgxLTk3OTMtMmI1MTI1NjYyZTEzXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_FMjpg_UX1000_.jpg",
        "https://m.media-amazon.com/images/M/MV5BNjRiNmNjMmMtN2U2Yi00ODgxLTk3OTMtMmI1MTI1NjYyZTEzXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_FMjpg_UX1000_.jpg",
        "https://m.media-amazon.com/images/M/MV5BNjRiNmNjMmMtN2U2Yi00ODgxLTk3OTMtMmI1MTI1NjYyZTEzXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_FMjpg_UX1000_.jpg"
      ],
      author: "Tsugumi Ohba",
      genre: ["Thriller", "Supernatural", "Mystery"],
      rating: 4.8,
      chapters: [],
      collection: "PROMISED PRINCESS",
      releaseDate: "2003-12-01",
      status: "completed",
      isFavorite: false,
      price: 0.01,
      purchased: false
    }
  ];

  private async initializeComicsIfNeeded() {
    const comicsRef = collection(this.db, 'comics');
    const snapshot = await getDocs(comicsRef);
    
    if (snapshot.empty) {
      console.log('Initializing comics collection...');
      for (const comic of this.initialComics) {
        const { id, ...comicData } = comic;
        await setDoc(doc(comicsRef, id), comicData);
      }
    }
  }

  async getAllComics(userId?: string): Promise<Comic[]> {
    await this.initializeComicsIfNeeded();
    
    const comicsRef = collection(this.db, 'comics');
    const snapshot = await getDocs(comicsRef);
    const comics = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Comic));
    
    if (userId) {
      const [favorites, purchases] = await Promise.all([
        this.getUserFavorites(userId),
        this.getUserPurchases(userId)
      ]);
      
      return comics.map(comic => ({
        ...comic,
        isFavorite: favorites.includes(comic.id),
        purchased: purchases.map(purchase => purchase.comicId).includes(comic.id)
      }));
    }
    
    return comics;
  }

  async getComicById(id: string, userId?: string): Promise<Comic | null> {
    const comicRef = doc(this.db, 'comics', id);
    const comicDoc = await getDoc(comicRef);
    
    if (!comicDoc.exists()) return null;
    
    const comic = { ...comicDoc.data(), id: comicDoc.id } as Comic;
    
    if (userId) {
      const [favorites, purchases] = await Promise.all([
        this.getUserFavorites(userId),
        this.getUserPurchases(userId)
      ]);
      
      comic.isFavorite = favorites.includes(comic.id);
      comic.purchased = purchases.map(purchase => purchase.comicId).includes(comic.id);
    }
    
    return comic;
  }

  async toggleFavorite(comicId: string, userId: string) {
    const userRef = doc(this.db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, { favorites: [comicId] });
    } else {
      const favorites = userDoc.data().favorites || [];
      if (favorites.includes(comicId)) {
        await updateDoc(userRef, {
          favorites: arrayRemove(comicId)
        });
      } else {
        await updateDoc(userRef, {
          favorites: arrayUnion(comicId)
        });
      }
    }
  }

  async purchaseComic(comicId: string, userId: string) {
    const userRef = doc(this.db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, { 
        purchases: [comicId],
        purchaseHistory: [{
          comicId,
          purchaseDate: new Date().toISOString()
        }]
      });
    } else {
      await updateDoc(userRef, {
        purchases: arrayUnion(comicId),
        purchaseHistory: arrayUnion({
          comicId,
          purchaseDate: new Date().toISOString()
        })
      });
    }
  }

  async getUserPurchases(userId: string): Promise<Purchase[]> {
    const userRef = doc(this.db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return [];
    }

    const purchaseHistory: PurchaseHistoryItem[] = userDoc.data().purchaseHistory || [];
    return purchaseHistory.map((purchase: PurchaseHistoryItem) => ({
      comicId: purchase.comicId,
      purchaseDate: new Date(purchase.purchaseDate),
      price: purchase.price || 0,
      isMonthly: purchase.isMonthly || false,
      subscriptionStatus: undefined,
      nextBillingDate: undefined
    }));
  }

  async getPurchasedComicIds(userId: string): Promise<string[]> {
    const purchases = await this.getUserPurchases(userId);
    return purchases.map(purchase => purchase.comicId);
  }

  async getUserFavorites(userId: string): Promise<string[]> {
    const userRef = doc(this.db, 'users', userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? (userDoc.data().favorites || []) : [];
  }

  async getFavorites(userId: string): Promise<string[]> {
    const userRef = doc(this.db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return [];
    }

    return userDoc.data().favorites || [];
  }

  async getUserProgress(userId: string, comicId: string): Promise<UserProgress | null> {
    const progressRef = doc(this.db, 'progress', `${userId}_${comicId}`);
    const progressDoc = await getDoc(progressRef);
    return progressDoc.exists() ? progressDoc.data() as UserProgress : null;
  }

  async updateUserProgress(progress: UserProgress) {
    const progressRef = doc(this.db, 'progress', `${progress.userId}_${progress.comicId}`);
    const updateData = {
      userId: progress.userId,
      comicId: progress.comicId,
      currentChapter: progress.currentChapter,
      currentPage: progress.currentPage,
      lastReadAt: progress.lastReadAt
    };
    await updateDoc(progressRef, updateData);
  }

  async searchComics(searchTerm: string): Promise<Comic[]> {
    const comicsRef = collection(this.db, 'comics');
    const q = query(
      comicsRef,
      where('title', '>=', searchTerm),
      where('title', '<=', searchTerm + '\uf8ff')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Comic));
  }

  async filterComics(filters: ComicFilters): Promise<Comic[]> {
    let comicsRef = collection(this.db, 'comics');
    let q = query(comicsRef);

    if (filters.genre) {
      q = query(q, where('genre', 'array-contains-any', filters.genre));
    }
    if (filters.author) {
      q = query(q, where('author', '==', filters.author));
    }
    if (filters.rating) {
      q = query(q, where('rating', '>=', filters.rating));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Comic));
  }

  async recordPurchase(userId: string, comic: Comic): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', userId);
      const purchaseRef = doc(collection(this.db, 'purchases'));

      const purchase: Purchase = {
        comicId: comic.id,
        purchaseDate: new Date(),
        price: comic.price,
        isMonthly: comic.isMonthly ?? false,
        ...(comic.isMonthly && {
          subscriptionStatus: 'active',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        }),
      };

      // Record the purchase
      await setDoc(purchaseRef, purchase);

      // Update user's purchased comics
      await updateDoc(userRef, {
        purchasedComics: arrayUnion(comic.id),
      });

      // If it's a monthly subscription, add to user's subscriptions
      if (comic.isMonthly) {
        await updateDoc(userRef, {
          activeSubscriptions: arrayUnion({
            comicId: comic.id,
            startDate: Timestamp.fromDate(new Date()),
            nextBillingDate: Timestamp.fromDate(purchase.nextBillingDate!),
          }),
        });
      }
    } catch (error) {
      console.error('Error recording purchase:', error);
      throw new Error('Failed to record purchase');
    }
  }

  async cancelSubscription(userId: string, comicId: string): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', userId);
      
      // Get user's current subscriptions
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      if (!userData?.activeSubscriptions) {
        throw new Error('No active subscriptions found');
      }

      // Find the subscription to cancel
      const subscription = userData.activeSubscriptions.find(
        (sub: any) => sub.comicId === comicId
      );

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Remove from active subscriptions
      await updateDoc(userRef, {
        activeSubscriptions: arrayRemove(subscription),
      });

      // Update purchase record
      const purchasesRef = collection(this.db, 'purchases');
      const q = query(
        purchasesRef,
        where('comicId', '==', comicId),
        where('userId', '==', userId)
      );

      const purchasesDocs = await getDocs(q);
      purchasesDocs.forEach(async (purchaseDoc) => {
        await updateDoc(doc(purchasesRef, purchaseDoc.id), {
          subscriptionStatus: 'cancelled',
          cancelDate: new Date(),
        });
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async checkSubscriptionStatus(userId: string): Promise<boolean> {
    try {
      const userRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      // Return false if no active subscriptions
      if (!userData || !userData.activeSubscriptions || userData.activeSubscriptions.length === 0) {
        return false;
      }

      const now = new Date();
      const updatedSubscriptions = userData.activeSubscriptions.filter(
        (sub: any) => {
          // Safely handle nextBillingDate
          const nextBillingDate = sub.nextBillingDate?.toDate();
          return nextBillingDate && nextBillingDate > now;
        }
      );

      // Update subscriptions if changed
      if (updatedSubscriptions.length !== userData.activeSubscriptions.length) {
        await updateDoc(userRef, {
          activeSubscriptions: updatedSubscriptions,
        });
      }

      // Return whether there are active subscriptions
      return updatedSubscriptions.length > 0;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }
}

export const comicService = new ComicService();
