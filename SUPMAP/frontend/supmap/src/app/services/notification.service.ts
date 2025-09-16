import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:4000/notification'; // adapte l'URL selon ton backend

  constructor(private http: HttpClient) {}

  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.apiUrl}/unreadCount`);
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch('http://localhost:4000/notification/markAsRead', {});
  }
  getLastNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/last`, { withCredentials: true });
  }
  
  

}
