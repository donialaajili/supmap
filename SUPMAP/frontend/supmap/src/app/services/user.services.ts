import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:4000/api/users'; // Adresse de ton backend

  constructor(private http: HttpClient) { }

  // Mise à jour du profil utilisateur
  updateProfile(userData: any): Observable<any> {
    return this.http.put('http://localhost:4000/users/me', userData);
  }

  // Changer le mot de passe
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post('http://localhost:4000/users/change-password', { oldPassword, newPassword });
  }

  // Mode clair/dark (par exemple, enregistré dans un backend)
  updateTheme(isLightMode: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-theme`, { isLightMode });
  }

  // Désactivation du compte
  deactivateAccount(): Observable<any> {
    return this.http.post('http://localhost:4000/users/deactivate', {});
  }

  // Suppression du compte
  deleteAccount(): Observable<any> {
    return this.http.delete('http://localhost:4000/users/delete');
  }

  reactivate(email: string, password: string) {
    return this.http.post('http://localhost:4000/users/restore-account', { email, password });
  }
}
