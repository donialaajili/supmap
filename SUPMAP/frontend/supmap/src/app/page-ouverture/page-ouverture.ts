import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-ouverture',
  templateUrl: 'page-ouverture.html',
  styleUrls: ['page-ouverture.scss'],
  standalone: false,
})
export class PageOuverture implements OnInit {

  constructor(private router: Router) {}
  ngOnInit() {
    // Rediriger après 3 secondes (3000 ms)
    setTimeout(() => {
      this.router.navigate(['/welcome']); // Remplacez '/home' par le chemin de la page suivante
    }, 3000);
  }

}
