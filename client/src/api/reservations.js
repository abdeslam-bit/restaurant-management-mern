import api from './axios';

export const createReservation = (data) => api.post('/reservations', data);
export const getReservations = (params = {}) => api.get('/reservations', { params });
export const updateReservationStatus = (id, status) => api.patch(`/reservations/${id}/status`, { status });
export const deleteReservation = (id) => api.delete(`/reservations/${id}`);
