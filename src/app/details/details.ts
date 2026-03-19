import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import axios from 'axios';
import { ToyModel } from '../../models/toy.model';
import { Utils } from '../utils';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common'; // Dodato za pipe-ove

@Component({
  selector: 'app-details',
  standalone: true, // Osigurano da je standalone
  imports: [
    MatCardModule,
    MatListModule,
    MatIconModule,
    RouterLink,
    MatButtonModule,
    CommonModule // Neophodno za prikaz brojeva i petlje
  ],
  templateUrl: './details.html',
  styleUrl: './details.css',
})
export class Details {
  public authService = AuthService;
  toy = signal<any | null>(null); // Koristimo any da bismo lakše dodali rating polje

  constructor(route: ActivatedRoute, utils: Utils) {
    route.params.subscribe(params => {
      const toyId = params['toyId'];
      axios.get(`https://toy.pequla.com/api/toy/${toyId}`)
        .then(rsp => {
          const data = rsp.data;
          // Prilikom učitavanja dodeljujemo mu ocenu iz memorije (3.0 ili sačuvanu)
          data.rating = AuthService.getLocalRating(data.id || data.toyId);
          this.toy.set(data);
        });
    });
  }

  /** Metoda za promenu ocene na klik */
  rateToy(star: number) {
    const currentToy = this.toy();
    if (currentToy) {
      const id = currentToy.id || currentToy.toyId;
      // Čuvamo ocenu globalno
      AuthService.updateGlobalRating(id, star);
      // Ažuriramo signal da bi se UI odmah promenio
      this.toy.set({ ...currentToy, rating: star });
    }
  }
}