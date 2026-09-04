export type FeedItemType = 'dish' | 'restaurant' | 'moment';
export type FeedFilter = 'for-you' | 'nearby' | 'trending' | 'dish' | 'restaurant' | 'moment' | 'budget' | 'open';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  subtitle: string;
  description: string;
  imageUrl?: string;
  recommendationReason: string;
  rating?: number;
  reviewCount?: number;
  price?: string;
  area?: string;
  tags: string[];
  isBookmarked: boolean;
}

export interface FeedPage {
  items: FeedItem[];
  nextCursor: string | null;
}

export interface ProfileSummary {
  displayName: string;
  username: string;
  city: string;
  bio: string;
  tasteTags: string[];
}

export type RootScreen = 'discover' | 'bookmarked' | 'profile';
export type CreationType = 'moment' | 'dish' | 'restaurant';
