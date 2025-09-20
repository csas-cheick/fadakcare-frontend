import { HttpService } from './httpService';

export interface NotificationItem {
  id: number;
  type: string;
  message: string;
  lu: boolean;
  utilisateurId: number;
  dateNotif: string;
  timeAgo: string;
}

const API_BASE = 'https://fadakcare-backend-1.onrender.com/api/notifications';

export const notificationService = {
  async listByUser(userId: number, take = 10, skip = 0) {
    const url = `${API_BASE}/user/${userId}?take=${take}&skip=${skip}`;
    const { data } = await HttpService.get<NotificationItem[]>(url);
    return data;
  },
  async unreadCount(userId: number) {
    const url = `${API_BASE}/user/${userId}/unread-count`;
    const { data } = await HttpService.get<{ count: number }>(url);
    return data.count;
  },
  async markOneRead(userId: number, id: number) {
    const url = `${API_BASE}/user/${userId}/mark-read/${id}`;
    await HttpService.post(url);
  },
  async markAllRead(userId: number) {
    const url = `${API_BASE}/user/${userId}/mark-all-read`;
    await HttpService.post(url);
  }
};
