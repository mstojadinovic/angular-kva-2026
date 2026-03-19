import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Alerts } from '../alerts';
import { ToyModel } from '../../models/toy.model';
import { ToyService } from '../../services/toy.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatListModule, MatIconModule
  ],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order {
  // Signal za čuvanje podataka o igrački (koristi se u HTML-u)
  toy = signal<ToyModel | null>(null);

  // Objekat za formu rezervacije
  order: any = { count: 1, deliveryMethod: 'standard' };

  constructor(public router: Router, private route: ActivatedRoute) {
    // 1. Pratimo parametre iz URL-a (ID igračke)
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (id) {
        // 2. Pozivamo servis za učitavanje podataka sa API-ja
        ToyService.getToyById(id).then(rsp => {
          if (rsp && rsp.data) {
            const data = rsp.data;

            /** * NOVO: DINAMIČKA OCENA
             * Umesto da pišemo 3.0, proveravamo u bazi ocena da li ovaj artikal već ima ocenu.
             * Ako nema, getLocalRating će vratiti 3.0.
             */
            data.rating = AuthService.getLocalRating(id);

            // Postavljamo podatke u signal
            this.toy.set(data);
          }
        }).catch(err => console.error("Greška pri učitavanju:", err));
      }
    });
  }

  /** Računanje ukupne cene na osnovu unete količine */
  calculateTotal() {
    const t = this.toy();
    return t ? t.price * this.order.count : 0;
  }

  /** Glavna logika za slanje rezervacije u korpu */
  placeOrder() {
    // Provera da li je korisnik ulogovan pre nego što dozvolimo rezervaciju
    if (!AuthService.isLoggedIn()) {
      Alerts.error("Niste ulogovani!");
      this.router.navigate(['/login']);
      return;
    }

    const t = this.toy();
    const currentUser = AuthService.getActiveUser();

    // Provera ispravnosti podataka
    if (!t || !currentUser) {
      Alerts.error("Greška: Korisnik nije prepoznat ili igračka nije učitana.");
      return;
    }

    Alerts.confirm("Da li želite da rezervišete ovu igračku?", () => {
      if (!currentUser.orders) {
        currentUser.orders = [];
      }

      // Kreiranje objekta koji ide u korpu
      const newOrder = {
        toyId: t.toyId || (t as any).id,
        name: t.name,
        price: t.price,
        imageUrl: t.imageUrl,
        description: t.description,
        productionDate: t.productionDate,
        type: t.type,
        age: t.ageGroup || (t as any).age,
        targetGroup: t.targetGroup,

        /** * DINAMIČKO SLANJE OCENE:
         * U korpu šaljemo trenutnu ocenu koju vidimo na ekranu.
         */
        rating: t.rating || AuthService.getLocalRating(t.toyId || (t as any).id),

        count: this.order.count,
        status: 'rezervisano',
        orderDate: new Date().toLocaleDateString()
      };

      // Dodavanje u listu korisnika i čuvanje u bazi (localStorage)
      currentUser.orders.push(newOrder);
      AuthService.updateActiveUser(currentUser);

      Alerts.success('Uspešno rezervisan! Igračka se sada nalazi u vašoj korpi.');

      // Automatski odlazak u korpu
      this.router.navigate(['/cart']);
    });
  }
}