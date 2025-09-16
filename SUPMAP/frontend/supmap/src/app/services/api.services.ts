import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrlAuth = 'http://localhost:4000'; // Adresse backend Auth
  private apiUrlUser = 'http://localhost:4000'; // Adresse backend User

  constructor(private http: HttpClient) { }

  // 🔹 Connexion utilisateur
  loginUser(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrlAuth}/auth/login`, credentials);
  }

  // 🔹 Inscription d'un nouvel utilisateur
  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrlAuth}/auth/register`, userData);
  }

  // 🔹 Récupérer le profil utilisateur
  getUserProfile(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    return this.http.get(`${this.apiUrlUser}/users/me`, headers);
  }


  // 🔹 Mettre à jour le profil utilisateur
  updateUserProfile(profileData: { username?: string; email?: string; telephone?: string }): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    return this.http.put(`${this.apiUrlUser}/users/me`, profileData, headers);
  }

  // 🔍 Rechercher un utilisateur
  searchUser(query: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.apiUrlUser}/users/search/${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // ➕ Envoyer une demande d'ami (par username)
  sendFriendRequest(targetUsername: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrlUser}/users/friend-request/${targetUsername}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // ✅ Accepter une demande d’ami
  acceptFriendRequest(username: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrlUser}/users/friend-request/${username}/accept`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // ❌ Refuser une demande d’ami
  refuseFriendRequest(username: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete(`${this.apiUrlUser}/users/friend-request/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 🔗 Supprimer un ami
  removeFriend(username: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete(`${this.apiUrlUser}/users/friend/${username}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // 📥 Obtenir les demandes d’amis reçues
  getFriendRequests(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.apiUrlUser}/users/friend-requests`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 🚫 Bloquer un utilisateur
  blockUser(username: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrlUser}/users/block/${username}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // ✅ Débloquer un utilisateur
  unblockUser(username: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrlUser}/users/unblock/${username}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 🌍 Géocoder une ville
  geocodeCity(city: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: { city }
    };
    console.log(`[🌍] Appel backend geocodeCity avec: ${city}`);
    return this.http.get(`${this.apiUrlUser}/routes/geocode`, headers);
  }

  getAddressFromCoordinates(lat: number, lon: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.apiUrlUser}/users/reverse-geocode?lat=${lat}&lon=${lon}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 🛣️ Créer un itinéraire
  createRoute(routeData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    return this.http.post(`${this.apiUrlUser}/routes`, routeData, headers);
  }

  // 🏙️ Suggestions de villes
  suggestCities(query: string): Observable<string[]> {
    return this.http.get<{ suggestions: string[] }>(`${this.apiUrlUser}/routes/cities`, {
      params: { query }
    }).pipe(map(res => res.suggestions));
  }

  getRoutesByUser(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.apiUrlUser}/routes/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  deleteRoute(routeId: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete(`${this.apiUrlUser}/routes/${routeId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  verifyEmailCode(data: { email: string, code: string }): Observable<any> {
    return this.http.post(`${this.apiUrlAuth}/auth/verify-code`, data);
  }

  resendVerificationCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrlAuth}/auth/resend-verification-code`, { email });
  }

  getRoutesById(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlUser}/routes/${id}`);
  }

  getAllRoutes() {
    return this.http.get(`${this.apiUrlUser}/routes`);
  }
  
  
}

