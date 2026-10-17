export type ReviewStatus = 'APPROVED' | 'FLAGGED' | 'HIDDEN' | 'approved' | 'flagged' | 'under_review' | 'removed';

export interface ReviewItem {
  id: string;
  hostId: string;
  winnerId?: string;
  rating: number;
  comment?: string | null;
  message?: string; // alias for comment for backward compatibility
  status: ReviewStatus | string;
  createdAt: string;
  updatedAt?: string;
  reviewerName: string;
  reviewerAvatar?: string | null;
  prizeTitle?: string;
  competitionTitle?: string;
  raffleSlug?: string | null;
  winType?: string;
  ticketNumber?: number | null;
  canBeFlagged?: boolean;
}

// HostReview alias for existing components
export type HostReview = ReviewItem;

export interface ReviewStats {
  averageRating: number | null;
  totalReviews: number;
  breakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    [key: number]: number;
  };
  percentages: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    [key: number]: number;
  };
}

export interface HostReviewsResponse {
  host: {
    id: string;
    name: string;
    slug: string;
  };
  stats: ReviewStats;
  reviews: ReviewItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateReviewInput {
  winnerId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

export interface HostDashboardReviewsResponse {
  metrics: {
    satisfactionRate: number | null;
    totalReviews: number;
    averageRating: number | null;
    breakdown: Record<number, number>;
    percentages: Record<number, number>;
  };
  reviews: ReviewItem[];
}
