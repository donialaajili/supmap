import { Component, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { RouteOptimizerService } from '../services/route-optimizer.service';
import * as L from 'leaflet';
import { ApiService } from '../services/api.services';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements AfterViewInit, OnDestroy {
  @Input() name?: string;
  map!: L.Map; // Instance de la carte
  startPoint: string = ''; // Point de départ
  endPoint: string = ''; // Destination
  optimizedRoute: any; // Variable pour stocker l'itinéraire optimisé
  waypoints: any[] = [];
  private mapInitialized = false;
  private routeLayer: L.LayerGroup = L.layerGroup();
  private markersLayer: L.LayerGroup = L.layerGroup();

  constructor(private routeOptimizerService: RouteOptimizerService,
    private apiService: ApiService
  ) { }

  ngAfterViewInit() {
    // Use a longer delay and check for the container element
    setTimeout(() => {
      this.initMap();

      // Add a second initialization after a longer delay as a backup
      setTimeout(() => {
        // If map is already initialized, just update its size
        if (this.mapInitialized && this.map) {
          console.log('Refreshing map size');
          this.map.invalidateSize(true);
        } else {
          // Try initializing again if it failed the first time
          console.log('Attempting map initialization again');
          this.initMap();
        }
      }, 1000);
    }, 300);
  }

  ngOnDestroy() {
    // Clean up resources when component is destroyed
    if (this.map) {
      this.map.remove();
    }
  }

  // Initialisation de la carte
  initMap() {
    try {
      console.log('Initializing map...');

      // Check if map container exists
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('Map container not found in the DOM');
        setTimeout(() => this.initMap(), 200); // Try again after a delay
        return;
      }

      console.log('Map container found, dimensions:', mapElement.clientWidth, 'x', mapElement.clientHeight);

      if (this.mapInitialized) {
        console.log('Map already initialized, refreshing size');
        this.map.invalidateSize();
        return;
      }

      // Create the map with Marseille as the default center
      this.map = L.map('map', {
        center: [43.2965, 5.3698],
        zoom: 13,
        zoomControl: true
      });

      // Add tile layer (map background)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Add scale control
      L.control.scale().addTo(this.map);

      // Create a layer group for routes and markers
      this.routeLayer = L.layerGroup().addTo(this.map);
      this.markersLayer = L.layerGroup().addTo(this.map);

      // Set flag to indicate map is initialized
      this.mapInitialized = true;
      console.log('Map successfully initialized');

      // Force a map refresh after a short delay
      setTimeout(() => {
        this.map.invalidateSize();
      }, 200);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  // Calculer l'itinéraire
  async calculateRoute() {
    console.log('calculateRoute called with:', this.startPoint, this.endPoint);

    if (!this.startPoint || !this.endPoint) {
      alert('Veuillez renseigner un point de départ et une destination.');
      return;
    }

    const loading = document.createElement('ion-loading');
    loading.message = 'Calcul de l\'itinéraire optimal...';
    document.body.appendChild(loading);
    await loading.present();

    try {
      // Étape 1 : géocoder le départ et l'arrivée via le backend
      const startGeo = await this.apiService.geocodeCity(this.startPoint).toPromise();
      const endGeo = await this.apiService.geocodeCity(this.endPoint).toPromise();

      const start = startGeo?.position;
      const end = endGeo?.position;

      if (!start || !end) throw new Error("Impossible de géocoder les villes");

      // Étape 2 : construire l'objet à envoyer au backend
      const routeData = {
        name: `Trajet ${this.startPoint} ➡ ${this.endPoint}`,
        startPoint: { lat: start.lat, lon: start.lon },
        endPoint: { lat: end.lat, lon: end.lon },
        waypoints: [],
        includeTollRoads: true
      };

      // Étape 3 : envoyer au backend pour créer l’itinéraire
      const createdRoute = await this.apiService.createRoute(routeData).toPromise();
      console.log('✅ Itinéraire créé :', createdRoute);

      this.optimizedRoute = createdRoute.route;

      // Étape 4 : afficher sur la carte
      this.displayRouteOnMap(this.optimizedRoute);

      const toast = document.createElement('ion-toast');
      toast.message = 'Itinéraire créé avec succès !';
      toast.duration = 2000;
      toast.position = 'bottom';
      document.body.appendChild(toast);
      await toast.present();

    } catch (error) {
      console.error('❌ Erreur lors du calcul de l\'itinéraire:', error);
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      alert("Erreur lors du calcul de l'itinéraire : " + (message || 'inconnue'));
    } finally {
      // Assure de toujours enlever le chargement même en cas d'erreur
      await loading.dismiss();
    }
  }



  // Fonction pour afficher l'itinéraire sur la carte
  displayRouteOnMap(route: any): void {
    console.log('displayRouteOnMap called with data:', route);

    if (!this.map || !this.mapInitialized) {
      console.error('Cannot display route: Map not initialized');
      return;
    }

    try {
      // Clear previous routes and markers
      this.routeLayer.clearLayers();
      this.markersLayer.clearLayers();

      if (!route) {
        console.error('Aucune donnée de route reçue');
        return;
      }

      let latlngs: any[] = [];

      // Handle different possible route data formats
      if (route.coordinates && Array.isArray(route.coordinates)) {
        // Format 1: { coordinates: [{lat, lng}, ...] }
        console.log('Using coordinates format');
        latlngs = route.coordinates.map((coord: any) => [coord.lat, coord.lng]);
      } else if (route.path && Array.isArray(route.path)) {
        // Format 2: { path: [{lat, lng}, ...] }
        console.log('Using path format');
        latlngs = route.path.map((coord: any) => [coord.lat, coord.lng]);
      } else if (Array.isArray(route)) {
        // Format 3: Direct array of coordinates
        console.log('Using array format');
        latlngs = route.map((coord: any) => {
          if (coord.lat && coord.lng) return [coord.lat, coord.lng];
          if (coord.latitude && coord.longitude) return [coord.latitude, coord.longitude];
          return coord; // Assume it's already in [lat, lng] format
        });
      } else if (typeof route === 'string') {
        // Try to parse it if it's a string (shouldn't normally happen)
        try {
          const parsed = JSON.parse(route);
          return this.displayRouteOnMap(parsed);
        } catch (e) {
          console.error('Failed to parse route string:', e);
        }
      } else {
        // Try to find any property that might be an array of coordinates
        console.log('Searching for coordinate array in route object');
        for (const key in route) {
          if (Array.isArray(route[key]) && route[key].length > 0) {
            const sample = route[key][0];
            if (sample && (sample.lat || sample.latitude)) {
              latlngs = route[key].map((coord: any) => {
                if (coord.lat && coord.lng) return [coord.lat, coord.lng];
                if (coord.latitude && coord.longitude) return [coord.latitude, coord.longitude];
                return null;
              }).filter(Boolean);
              if (latlngs.length > 0) {
                console.log(`Found coordinates in property ${key}`);
                break;
              }
            }
          }
        }
      }

      console.log('Extracted coordinates:', latlngs);

      if (!latlngs || latlngs.length === 0) {
        console.error('Aucun point trouvé dans les données de route');

        // For testing: Create a simple test route if no real data is available
        if (this.startPoint && this.endPoint) {
          alert('Aucun point trouvé dans les données, affichage d\'un itinéraire de test à la place');

          // Center map on Marseille for testing
          this.map.setView([43.2965, 5.3698], 12);

          // Create a dummy test route
          latlngs = [
            [43.2965, 5.3698], // Marseille center
            [43.3050, 5.3800], // Slightly north-east
            [43.3100, 5.4000], // Further north-east
            [43.3200, 5.4100]  // End point
          ];
        } else {
          return;
        }
      }

      // Create route polyline
      console.log('Creating polyline with coordinates');
      const polyline = L.polyline(latlngs, {
        color: 'blue',
        weight: 5,
        opacity: 0.7
      }).addTo(this.routeLayer);

      // Add markers for start and end points
      if (latlngs.length > 0) {
        const startPoint = latlngs[0];
        const endPoint = latlngs[latlngs.length - 1];

        console.log('Adding markers for start/end points:', startPoint, endPoint);

        const startMarker = L.marker(startPoint).addTo(this.markersLayer)
          .bindPopup('Point de départ').openPopup();

        const endMarker = L.marker(endPoint).addTo(this.markersLayer)
          .bindPopup('Destination');
      }

      // Fit map to show the entire route
      console.log('Adjusting map view to fit route');
      this.map.fitBounds(polyline.getBounds(), {
        padding: [30, 30] // Add some padding around the route
      });

      // Show incidents along the route if available
      if (route.incidents) {
        console.log('Found incidents to display:', route.incidents.length);
        this.showIncidentsAlongRoute(route.incidents);
      }

      // Force a refresh of the map
      this.map.invalidateSize();

    } catch (error) {
      console.error('Erreur lors de l\'affichage de l\'itinéraire:', error);
    }
  }

  // Afficher les incidents le long de l'itinéraire
  showIncidentsAlongRoute(incidents: any[]) {
    console.log('Showing incidents along route:', incidents);

    if (!incidents || incidents.length === 0) return;

    try {
      // Créer une icône personnalisée pour les incidents
      const incidentIcon = L.divIcon({
        className: 'incident-marker',
        html: '<div style="background-color: red; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">!</div>',
        iconSize: [20, 20]
      });

      // Ajouter des marqueurs pour chaque incident
      incidents.forEach(incident => {
        let lat, lng;

        if (incident.latitude && incident.longitude) {
          lat = incident.latitude;
          lng = incident.longitude;
        } else if (incident.lat && incident.lng) {
          lat = incident.lat;
          lng = incident.lng;
        } else if (incident.location && incident.location.coordinates) {
          // GeoJSON format
          lng = incident.location.coordinates[0];
          lat = incident.location.coordinates[1];
        }

        if (lat && lng) {
          const description = incident.description || incident.type || 'Incident';
          L.marker([lat, lng], { icon: incidentIcon })
            .addTo(this.markersLayer)
            .bindPopup(`<b>${incident.type || 'Incident'}</b><br>${description}`);
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'affichage des incidents:', error);
    }
  }
}

