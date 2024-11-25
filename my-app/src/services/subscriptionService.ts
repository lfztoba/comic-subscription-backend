import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { Subscription } from '../types/subscription';

class SubscriptionService {
    private db = getFirestore();
    private subscriptionsCollection = 'subscriptions';

    async createSubscription(userId: string, comicId: string, stripeSubscriptionId: string): Promise<void> {
        const subscription: Subscription = {
            id: `${userId}_${comicId}`,
            userId,
            comicId,
            stripeSubscriptionId,
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            createdAt: new Date(),
        };

        await setDoc(doc(this.db, this.subscriptionsCollection, subscription.id), subscription);
    }

    async updateSubscriptionStatus(stripeSubscriptionId: string, status: 'active' | 'canceled' | 'past_due', currentPeriodEnd?: Date): Promise<void> {
        const subscriptionsRef = collection(this.db, this.subscriptionsCollection);
        const q = query(subscriptionsRef, where('stripeSubscriptionId', '==', stripeSubscriptionId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const subscriptionDoc = querySnapshot.docs[0];
            const updateData: Partial<Subscription> = { status };
            
            if (currentPeriodEnd) {
                updateData.currentPeriodEnd = currentPeriodEnd;
            }
            
            if (status === 'canceled') {
                updateData.canceledAt = new Date();
            }

            await updateDoc(doc(this.db, this.subscriptionsCollection, subscriptionDoc.id), updateData);
        }
    }

    async getActiveSubscription(userId: string, comicId: string): Promise<Subscription | null> {
        const subscriptionDoc = await getDoc(doc(this.db, this.subscriptionsCollection, `${userId}_${comicId}`));
        
        if (subscriptionDoc.exists()) {
            const subscription = subscriptionDoc.data() as Subscription;
            if (subscription.status === 'active') {
                return subscription;
            }
        }
        
        return null;
    }

    async getUserSubscriptions(userId: string): Promise<Subscription[]> {
        const subscriptionsRef = collection(this.db, this.subscriptionsCollection);
        const q = query(subscriptionsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => doc.data() as Subscription);
    }
}

export const subscriptionService = new SubscriptionService();
