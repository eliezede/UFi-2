export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  language?: 'en' | 'es' | 'pt';
}

export interface Track {
  id: string;
  artistId: string;
  artistName: string;
  artistPhotoURL?: string;
  title: string;
  description: string;
  coverImageURL: string;
  audioURL: string;
  duration?: number;
  genre?: string;
  mood?: string;
  tags?: string[];
  createdAt: any; // Firestore Timestamp
  likesCount: number;
  playsCount: number;
}

export interface Playlist {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  coverImageURL?: string;
  tracks: string[]; // Array of Track IDs
  createdAt: any;
}

export interface Comment {
  id: string;
  trackId: string;
  userId: string;
  displayName: string;
  photoURL: string | null;
  content: string;
  createdAt: any;
}

export enum PlayerStatus {
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED'
}

export type ActivityType = 'like' | 'follow' | 'comment' | 'upload';

export interface Activity {
  id: string;
  type: ActivityType;
  fromUserId: string;
  fromUserName: string;
  fromUserPhoto?: string;
  toUserId?: string; // For follows
  trackId?: string; // For likes/comments
  trackTitle?: string;
  trackCover?: string;
  createdAt: any;
}