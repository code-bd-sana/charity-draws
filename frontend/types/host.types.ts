export interface VerifiedHost {
  id: string;
  slug: string;
  name: string;
  logo?: string | null;
  description?: string | null;
  location?: string | null;
  category?: string | null;
  competitionCount: number;
  activeCompetitions?: number;
  pastCompetitions?: number;
  isVerified: boolean;
  memberSince?: number | string;
}

export interface HostDetail {
  id: string;
  slug: string;
  name: string;
  logo?: string | null;
  bio?: string | null;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  isVerified: boolean;
  drawsHosted: number;
  activeDrawsCount: number;
  pastDrawsCount: number;
  memberSince: number | string;
  joinedAt?: string;
  raffles: any[];
}

