import { api } from './api';
import {
  CreateReviewInput,
  HostDashboardReviewsResponse,
  HostReviewsResponse,
  UpdateReviewInput,
} from '../types/review.types';

export const reviewService = {
  /**
   * Submit a verified winner review (Protected)
   */
  async createReview(data: CreateReviewInput) {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  /**
   * Fetch public reviews and rating stats for a host (Public)
   */
  async getHostReviews(
    hostId: string,
    params?: { page?: number; limit?: number; rating?: number },
  ): Promise<HostReviewsResponse> {
    const response = await api.get(`/reviews/host/${hostId}`, { params });
    return response.data;
  },

  /**
   * Fetch reviews submitted by current logged-in user (Protected)
   */
  async getMyReviews() {
    const response = await api.get('/reviews/my-reviews');
    return response.data;
  },

  /**
   * Fetch reviews received by authenticated host (Protected - Host only)
   */
  async getHostDashboardReviews(): Promise<HostDashboardReviewsResponse> {
    const response = await api.get('/reviews/host-dashboard');
    return response.data;
  },

  /**
   * Edit rating / comment on existing review (Protected)
   */
  async updateReview(id: string, data: UpdateReviewInput) {
    const response = await api.patch(`/reviews/${id}`, data);
    return response.data;
  },

  /**
   * Flag suspicious review for admin moderation (Protected)
   */
  async flagReview(id: string, reason?: string) {
    const response = await api.post(`/reviews/${id}/flag`, { reason });
    return response.data;
  },
};
