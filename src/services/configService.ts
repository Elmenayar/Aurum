import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';

export interface ScoringWeights {
  registration: number;
  communication: number;
  closure: number;
  vip: number;
}

export interface AppConfig {
  emailNotificationsEnabled: boolean;
  adminEmail: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  metaPixelId?: string;
  tiktokPixelId?: string;
  scoringWeights: ScoringWeights;
}

const CONFIG_DOC_PATH = 'config/global';

const DEFAULT_CONFIG: AppConfig = {
  emailNotificationsEnabled: false,
  adminEmail: 'admin@aurum.com',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  twitterUrl: 'https://twitter.com',
  linkedinUrl: 'https://linkedin.com',
  tiktokUrl: 'https://tiktok.com',
  scoringWeights: {
    registration: 25,
    communication: 25,
    closure: 25,
    vip: 25
  }
};

export const configService = {
  async getConfig(): Promise<AppConfig> {
    const docRef = doc(db, CONFIG_DOC_PATH);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...DEFAULT_CONFIG,
        ...data,
        scoringWeights: {
          ...DEFAULT_CONFIG.scoringWeights,
          ...(data.scoringWeights || {})
        }
      } as AppConfig;
    }
    return DEFAULT_CONFIG;
  },

  async updateConfig(config: Partial<AppConfig>) {
    const docRef = doc(db, CONFIG_DOC_PATH);
    return setDoc(docRef, config, { merge: true });
  },

  subscribeToConfig(callback: (config: AppConfig) => void, onError?: (error: any) => void) {
    const docRef = doc(db, CONFIG_DOC_PATH);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          ...DEFAULT_CONFIG,
          ...data,
          scoringWeights: {
            ...DEFAULT_CONFIG.scoringWeights,
            ...(data.scoringWeights || {})
          }
        } as AppConfig);
      } else {
        callback(DEFAULT_CONFIG);
      }
    }, (error) => {
      console.error("Config Subscribe Error:", error);
      if (onError) onError(error);
    });
  }
};
