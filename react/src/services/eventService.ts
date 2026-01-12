/**
 * Event Service
 * Handles event and event application operations
 */

import { apiClient, extractData, createFormData } from './api';
import {
  EventRequest,
  EventResponse,
  EventApplicationRequest,
  EventApplicationResponse,
  ApiResponse,
} from '../types/api';

export const eventService = {
  /**
   * Get all events
   * GET /api/events
   */
  getAll: async (params?: {
    status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  }): Promise<EventResponse[]> => {
    const response = await apiClient.get<ApiResponse<EventResponse[]>>(
      '/events',
      { params }
    );
    return extractData(response);
  },

  /**
   * Get upcoming events
   * GET /api/events/upcoming
   */
  getUpcoming: async (): Promise<EventResponse[]> => {
    const response = await apiClient.get<ApiResponse<EventResponse[]>>(
      '/events/upcoming'
    );
    return extractData(response);
  },

  /**
   * Get event by ID
   * GET /api/events/{id}
   */
  getById: async (id: string): Promise<EventResponse> => {
    const response = await apiClient.get<ApiResponse<EventResponse>>(
      `/events/${id}`
    );
    return extractData(response);
  },

  /**
   * Create new event
   * POST /api/events
   * Requires Admin role
   */
  create: async (data: EventRequest): Promise<EventResponse> => {
    const formData = data.image instanceof File
      ? createFormData(data)
      : data;

    const response = await apiClient.post<ApiResponse<EventResponse>>(
      '/events',
      formData,
      {
        headers: data.image instanceof File
          ? { 'Content-Type': 'multipart/form-data' }
          : undefined,
      }
    );
    return extractData(response);
  },

  /**
   * Update event
   * PUT /api/events/{id}
   * Requires Admin role
   */
  update: async (id: string, data: Partial<EventRequest>): Promise<EventResponse> => {
    const formData = data.image instanceof File
      ? createFormData({ ...data, _method: 'PUT' })
      : data;

    const response = await apiClient.post<ApiResponse<EventResponse>>(
      `/events/${id}`,
      formData,
      {
        headers: data.image instanceof File
          ? { 'Content-Type': 'multipart/form-data' }
          : undefined,
      }
    );
    return extractData(response);
  },

  /**
   * Delete event
   * DELETE /api/events/{id}
   * Requires Admin role
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },

  // ============================================
  // EVENT APPLICATIONS
  // ============================================

  /**
   * Apply to event
   * POST /api/events/{eventId}/apply
   * Requires UMKM role
   */
  apply: async (data: EventApplicationRequest): Promise<EventApplicationResponse> => {
    const response = await apiClient.post<ApiResponse<EventApplicationResponse>>(
      `/events/${data.event_id}/apply`,
      data
    );
    return extractData(response);
  },

  /**
   * Get applications for an event
   * GET /api/events/{eventId}/applications
   * Requires Admin role
   */
  getApplications: async (eventId: string): Promise<EventApplicationResponse[]> => {
    const response = await apiClient.get<ApiResponse<EventApplicationResponse[]>>(
      `/events/${eventId}/applications`
    );
    return extractData(response);
  },

  /**
   * Get my applications
   * GET /api/events/my-applications
   * Requires UMKM role
   */
  getMyApplications: async (): Promise<EventApplicationResponse[]> => {
    const response = await apiClient.get<ApiResponse<EventApplicationResponse[]>>(
      '/events/my-applications'
    );
    return extractData(response);
  },

  /**
   * Approve event application
   * PUT /api/events/applications/{applicationId}/approve
   * Requires Admin role
   */
  approveApplication: async (applicationId: string): Promise<EventApplicationResponse> => {
    const response = await apiClient.put<ApiResponse<EventApplicationResponse>>(
      `/events/applications/${applicationId}/approve`
    );
    return extractData(response);
  },

  /**
   * Reject event application
   * PUT /api/events/applications/{applicationId}/reject
   * Requires Admin role
   */
  rejectApplication: async (applicationId: string, reason?: string): Promise<EventApplicationResponse> => {
    const response = await apiClient.put<ApiResponse<EventApplicationResponse>>(
      `/events/applications/${applicationId}/reject`,
      { reason }
    );
    return extractData(response);
  },

  /**
   * Cancel my application
   * DELETE /api/events/applications/{applicationId}
   * Requires UMKM role
   */
  cancelApplication: async (applicationId: string): Promise<void> => {
    await apiClient.delete(`/events/applications/${applicationId}`);
  },
};
