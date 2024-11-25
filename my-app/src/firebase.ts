import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB1RIQ9Onb-nXW6afefG2pi0olaTpz_w1o",
    authDomain: "comic-zkz7ay.firebaseapp.com",
    projectId: "comic-zkz7ay",
    storageBucket: "comic-zkz7ay.firebasestorage.app",
    messagingSenderId: "42894300350",
    appId: "1:42894300350:web:7dd27e3ca2591712d67aef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Newsletter Functions
export const addNewsletterSubscription = async (email: string) => {
    try {
        const docRef = await addDoc(collection(db, "newsletter_subscriptions"), {
            email,
            subscribedAt: Timestamp.now(),
            status: "active"
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding subscription: ", error);
        return { success: false, error };
    }
};

export const getNewsletterSubscriptions = async () => {
    try {
        const q = query(
            collection(db, "newsletter_subscriptions"),
            orderBy("subscribedAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting subscriptions: ", error);
        return [];
    }
};
