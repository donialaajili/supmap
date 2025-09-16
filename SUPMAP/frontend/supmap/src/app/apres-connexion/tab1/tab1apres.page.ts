
import { TrafficIncidentService } from './../../services/traffic-incident.service';
import { Component, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { RouteOptimizerService } from '../../services/route-optimizer.service';
import * as L from 'leaflet';
import { ApiService } from '../../services/api.services';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from './../../services/notification.service';


@Component({
  selector: 'app-tab1apres',
  templateUrl: 'tab1apres.page.html',
  styleUrls: ['tab1apres.page.scss'],
  standalone: false,
})
export class Tab1apresPage implements AfterViewInit, OnDestroy {

  @Input() name?: string;

  userName: string = 'Utilisateur';
  isPopoverOpen = false;
  popoverEvent: any;
  isNotificationsOpen = false;
  notificationsEvent: any;
  notifications: { type: string; description: string; distance: number}[] = [];
  unreadCount: number = 0;


  map!: L.Map;
  startPoint: string = '';
  endPoint: string = '';
  optimizedRoute: any;
  waypoints: any[] = [];
  private mapInitialized = false;
  private routeLayer: L.LayerGroup = L.layerGroup();
  private markersLayer: L.LayerGroup = L.layerGroup();
  private summaryPopup?: L.Popup;

  travelSummary: {
    distance?: number;
    estimatedTime?: number;
    costEstimate?: number;
  } = {};

  inputTarget: 'start' | 'end' = 'start';
  citySuggestions: string[] = [];


friendRequests: any[] = [];

isNotificationPopoverOpen = false;
notificationPopoverEvent: any;

isFriendPopoverOpen = false;
friendPopoverEvent: any;




  constructor(
    private routeOptimizerService: RouteOptimizerService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private TrafficIncidentService: TrafficIncidentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      localStorage.setItem('token', token);
      console.log('✅ Token enregistré depuis les query params');
    }
    this.fetchUnreadCount();



    const lat = this.route.snapshot.queryParamMap.get('lat');
    const lng = this.route.snapshot.queryParamMap.get('lng');
    const type = this.route.snapshot.queryParamMap.get('type');
    const desc = this.route.snapshot.queryParamMap.get('desc');

    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);

      if (!isNaN(latNum) && !isNaN(lngNum)) {
        setTimeout(() => {
          if (this.mapInitialized && this.map) {
            this.map.setView([latNum, lngNum], 17);
            this.markersLayer.clearLayers();

            const popupContent = `<b>${type ?? 'Type inconnu'}</b><br/>${desc ?? 'Aucune description.'}`;
            L.marker([latNum, lngNum]).addTo(this.markersLayer).bindPopup(popupContent).openPopup();
          }
        }, 500);
      }
    }


    this.apiService.getUserProfile().subscribe({
      next: (data) => {
        this.userName = data.username || 'Utilisateur';
      },
      error: (err) => {
        console.error('Erreur récupération user:', err);
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
      setTimeout(() => {
        if (this.mapInitialized && this.map) {
          this.map.invalidateSize(true);
        } else {
          this.initMap();
        }
      }, 1000);
    }, 300);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  ionViewDidEnter() {
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize(true);
      } else if (!this.mapInitialized) {
        this.initMap();
      }
    }, 300);
  }

  initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      setTimeout(() => this.initMap(), 200);
      return;
    }

    if (this.mapInitialized) {
      this.map.invalidateSize();
      return;
    }

    this.map = L.map('map', {
      center: [43.2965, 5.3698],
      zoom: 13,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    L.control.scale().addTo(this.map);
    this.routeLayer = L.layerGroup().addTo(this.map);
    this.markersLayer = L.layerGroup().addTo(this.map);
    this.mapInitialized = true;

    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }

  openMenu(event: Event) {
    this.popoverEvent = event;
    this.isPopoverOpen = true;
  }

  goToProfile() {
    this.isPopoverOpen = false;
    setTimeout(() => {
      this.router.navigate(['/testprofil']);
    }, 300);
  }

  goToSettings() {
    this.router.navigate(['/parametre']);
    this.isPopoverOpen = false;
  }

  toggleDarkMode() {
    document.body.classList.toggle('dark');
    this.isPopoverOpen = false;
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/connexion']);
  }

  async calculateRoute() {
    if (!this.startPoint || !this.endPoint) {
      alert('Veuillez renseigner un point de départ et une destination.');
      return;
    }

    try {
      const loading = document.createElement('ion-loading');
      loading.message = "Calcul de l'itinéraire optimal...";
      document.body.appendChild(loading);
      await loading.present();

      const startGeo = await firstValueFrom(this.apiService.geocodeCity(this.startPoint));
      const endGeo = await firstValueFrom(this.apiService.geocodeCity(this.endPoint));

      const start = startGeo?.position;
      const end = endGeo?.position;

      if (!start || !end) throw new Error("Impossible de géocoder les villes");

      const routeData = {
        name: `Trajet ${this.startPoint} ➞ ${this.endPoint}`,
        startPoint: { lat: start.lat, lon: start.lon },
        endPoint: { lat: end.lat, lon: end.lon },
        waypoints: [],
        includeTollRoads: true
      };

      const createdRoute = await this.apiService.createRoute(routeData).toPromise();
      this.optimizedRoute = createdRoute.route;

      this.travelSummary = {
        distance: createdRoute.route.distance,
        estimatedTime: createdRoute.route.estimatedTime,
        costEstimate: createdRoute.route.costEstimate
      };

      await loading.dismiss();
      this.displayRouteOnMap(this.optimizedRoute);

      this.TrafficIncidentService.getAllIncidents().subscribe({
        next: (signalements: any) => {
          console.log('Données reçues:', signalements); // Vérifie la structure

          // Accéder à l'array "incidents"
          const signalementsArray = Array.isArray(signalements.incidents) ? signalements.incidents : Object.values(signalements.incidents);
          console.log('Signalements convertis en tableau:', signalementsArray);

          const dangerIcon = L.divIcon({
            className: 'ion-icon',
            html: '<ion-icon name="warning-outline" style="font-size: 30px; color: red;"></ion-icon>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
          });

          signalementsArray.forEach((signalement: any) => {
            const { type, description } = signalement;
            const location = signalement.location; // Récupérer l'objet location
            console.log('Location de ce signalement:', location); // Vérifie la structure de location

            // Vérifie si location contient lat et lng
            const lat = location?.coordinates?.[1];  // latitude dans le tableau coordinates
const lon = location?.coordinates?.[0]; // longitude dans le tableau coordinates


            console.log('Latitude:', lat, 'Longitude:', lon); // Affiche lat et lng

            if (lat && lon) {
              const popupContent = `<b>${type}</b><br/>${description || 'Aucune description.'}`;
              L.marker([lat, lon], { icon: dangerIcon })
                .addTo(this.markersLayer)
                .bindPopup(popupContent);
            } else {
              console.error('Latitude ou Longitude manquante:', signalement);
            }
          });
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des signalements:', err);
        }
      });





      const toast = document.createElement('ion-toast');
      toast.message = "Itinéraire créé avec succès !";
      toast.duration = 2000;
      toast.position = 'bottom';
      document.body.appendChild(toast);
      await toast.present();

    } catch (error) {
      console.error("❌ Erreur lors du calcul de l'itinéraire:", error);
      alert("Erreur : " + (error instanceof Error ? error.message : JSON.stringify(error)));
    }
  }

  displayRouteOnMap(route: any): void {
    if (this.summaryPopup) {
      this.map.removeLayer(this.summaryPopup);
      this.summaryPopup = undefined;
    }

    this.routeLayer.clearLayers();
    this.markersLayer.clearLayers();

    let latlngs: any[] = [];

    if (!route.coordinates && route.startPoint && route.endPoint) {
      route.coordinates = [
        { lat: route.startPoint.lat, lng: route.startPoint.lon },
        { lat: route.endPoint.lat, lng: route.endPoint.lon }
      ];
    }

    if (route.coordinates) {
      latlngs = route.coordinates.map((c: any) => [c.lat, c.lng]);
    } else if (route.path) {
      latlngs = route.path.map((c: any) => [c.lat, c.lng]);
    }

    if (!latlngs.length) return;

    const polyline = L.polyline(latlngs, {
      color: 'blue',
      weight: 5,
      opacity: 0.7
    }).addTo(this.routeLayer);

    if (this.travelSummary.distance && this.travelSummary.estimatedTime && this.travelSummary.costEstimate) {
      const center = polyline.getBounds().getCenter();
      const hours = Math.floor(this.travelSummary.estimatedTime / 60);
      const minutes = Math.round(this.travelSummary.estimatedTime % 60);
      const popupContent = `
        <b>🛣️ Itinéraire</b><br>
        Distance : ${this.travelSummary.distance.toFixed(1)} km<br>
        Durée : ${hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`}<br>
      `;
      this.summaryPopup = L.popup({ closeButton: false, autoClose: false })
        .setLatLng(center)
        .setContent(popupContent)
        .addTo(this.map);
    }

    L.marker(latlngs[0]).addTo(this.markersLayer).bindPopup('Point de départ').openPopup();
    L.marker(latlngs[latlngs.length - 1]).addTo(this.markersLayer).bindPopup('Destination');

    this.map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
    this.map.invalidateSize();
  }

  selectSuggestedCity(city: string) {
    if (this.inputTarget === 'start') {
      this.startPoint = city;
    } else {
      this.endPoint = city;
    }
    this.citySuggestions = [];
  }

  onCityInputChanged(event: any, target: 'start' | 'end') {
    const query = event.target.value;
    this.inputTarget = target;

    if (query && query.length >= 2) {
      this.apiService.suggestCities(query).subscribe({
        next: (suggestions: string[]) => {
          this.citySuggestions = suggestions;
        },
        error: (err) => {
          console.error('Erreur lors de la suggestion de villes :', err);
        }
      });
    } else {
      this.citySuggestions = [];
    }
  }

 useCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          // Appelle le backend pour récupérer l'adresse
          this.apiService.getAddressFromCoordinates(lat, lon).subscribe(
            (data) => {
              const address = data?.addresses?.[0]?.address;
              if (address) {
                this.startPoint = `${address.streetName || ''} ${address.municipality || ''}`.trim();
              } else {
                alert("Adresse non trouvée.");
              }
            },
            (error) => {
              console.error("Erreur reverse geocode :", error);
              alert("Erreur lors de la récupération de l'adresse.");
            }
          );
        },
        error => {
          console.error("Erreur de géolocalisation :", error);
          alert("Impossible de récupérer votre position actuelle.");
        }
      );
    } else {
      alert("La géolocalisation n'est pas prise en charge par ce navigateur.");
    }
  }
  getUserIdFromToken(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || '';
    } catch (err) {
      console.error('Token invalide', err);
      return '';
    }
  }
  fetchUnreadCount() {
    this.notificationService.getUnreadCount().subscribe(
      (data) => {
        this.unreadCount = data.unreadCount;
      },
      (error) => {
        console.error('Erreur récupération notifications non lues', error);
      }
    );
  }
  markNotificationsAsRead() {
    this.notificationService.markAllAsRead().subscribe(
      () => {
        this.fetchUnreadCount(); // recharge le nombre exact après succès
      },
      (error) => {
        console.error('Erreur lors du marquage des notifications comme lues', error);
      }
    );
  }





  openNotifications(event: Event) {
    this.notificationsEvent = event;
    this.isNotificationsOpen = true;
  }

  clearNotifications() {
    this.notifications = [];
    this.isNotificationsOpen = false;
  }

  addNotification(message: string, distance: number) {
    this.notifications.push({
      type: 'Notification', // ou un autre type selon le contexte
      description: message,
      distance: distance,
    });
  }


  openNotificationPopover(ev: Event) {
    this.notificationPopoverEvent = ev;
    this.isNotificationPopoverOpen = true;

    this.markNotificationsAsRead(); // Marque tout comme lu + rafraîchit le compteur
    this.loadNotifications();       // Recharge les dernières notifications
  }


  openFriendRequestPopover(ev: Event) {
    this.friendPopoverEvent = ev;
    this.isFriendPopoverOpen = true;
    this.loadFriendRequests(); // appelle l'API
  }

  loadNotifications() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        this.TrafficIncidentService.getLastIncidents().subscribe((data: any) => {
          const incidents = data.incidents || data;

          this.notifications = incidents.map((incident: any) => {
            const [lon, lat] = incident.location.coordinates;
            const distance = this.getDistanceFromLatLonInKm(userLat, userLon, lat, lon);

            return {
              ...incident,
              distance: distance
            };
          });
        });
      },
      (error) => {
        console.error('Erreur de géolocalisation pour notifications', error);
      }
    );
  }



  loadFriendRequests() {
    this.apiService.getFriendRequests().subscribe((data: any) => {
      this.friendRequests = data.requests || data;
    });
  }



  acceptFriend(requestId: string) {
    this.apiService.acceptFriendRequest(requestId).subscribe(() => {
      this.loadFriendRequests(); // refresh
    });
  }
  getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }


}
