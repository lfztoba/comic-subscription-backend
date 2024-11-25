export interface Subscription {
    id: string;
    userId: string;
    comicId: string;
    stripeSubscriptionId: string;
    status: 'active' | 'canceled' | 'past_due';
    currentPeriodEnd: Date;
    createdAt: Date;
    canceledAt?: Date;
}
