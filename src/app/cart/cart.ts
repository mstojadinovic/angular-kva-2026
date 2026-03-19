import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Alerts } from '../alerts';
// Angular Material Importi za tabelu i dizajn
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule,
    MatTableModule, MatButtonModule, MatIconModule, RouterLink
  ],
  templateUrl: './cart.html'
})
export class Cart {
  // Definišemo kolone koje će se prikazati u tabeli korpe (mora se poklapati sa matColumnDef u HTML-u)
  displayedColumns: string[] = ['slika', 'ime', 'opis', 'ocena', 'kategorija', 'datum', 'namenjeno', 'kolicina', 'status', 'cena', 'opcije'];

  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    // Sigurnosna provera: Ako korisnik nije ulogovan, šaljemo ga na login stranu
    if (!AuthService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  /** * DOHVATANJE NARUDŽBINA
   * Svaki put kada Angular osvežava tabelu, vučemo sveže podatke aktivnog korisnika.
   */
  getOrders() {
    const user = AuthService.getActiveUser();
    return user ? (user.orders || []) : [];
  }

  /** * UKUPNA SUMA
   * Prolazi kroz sve stavke u korpi i množi cenu sa količinom.
   */
  calculateTotal() {
    return this.getOrders().reduce((sum: number, t: any) => sum + (t.price * (t.count || 1)), 0);
  }

  /** * BRISANJE STAVKE
   * Dozvoljava brisanje samo ako je status 'pristiglo'.
   */
  removeOrder(toy: any) {
    if (toy.status !== 'pristiglo') {
      Alerts.confirm('Da li ste sigurni da želite da obrišete igračku iz istorije? Ova akcija je nepovratna.', () => {
        AuthService.deleteOrderPermanently(toy.toyId || toy.id);
        this.cdr.detectChanges(); // Osvežavamo tabelu nakon brisanja
      });
    } else {
      Alerts.error('Pristigle igračke se ne mogu brisati iz istorije!');
    }


  }

  /** * GLAVNA LOGIKA ZA OCENJIVANJE (ZVEZDICE)
   * Kada korisnik klikne na npr. 4. zvezdicu, starClicked će biti 4.
   * Ova promena se šalje u AuthService koji je dalje prosleđuje u Globalnu bazu ocena.
   */
  rateToy(toy: any, starClicked: number) {
    // Kupac može ocenjivati samo ako je status igračke 'pristiglo'
    if (toy.status === 'pristiglo') {

      // Pozivamo servis koji ažurira ocenu i u korpi i globalno (za Home/Order)
      AuthService.updateOrderRating(toy.toyId || toy.id, starClicked);

      // Forsiramo Angular da odmah "pozlati" zvezdice na ekranu
      this.cdr.detectChanges();

      Alerts.success(`Igračka "${toy.name}" ocenjena sa ${starClicked} zvezdica. Promena je vidljiva svuda!`);
    } else {
      Alerts.error('Ocenjivanje je moguće tek nakon što igračka pristigne!');
    }
  }

  /** * TEST DUGME: SIMULACIJA DOSTAVE
   * Postavlja sve artikle na status 'pristiglo' kako bismo mogli da testiramo zvezdice.
   */
  simulateArrival() {
    AuthService.markOrdersAsArrived();
    this.cdr.detectChanges();
    Alerts.success('Sve igračke su pristigle. Ukoliko želite, sada ih možete oceniti!');
  }

  /** Povećava broj komada određene igračke u korpi */
  incrementCount(toy: any) {
    AuthService.updateOrderCount(toy.toyId || toy.id, (toy.count || 1) + 1);
    this.cdr.detectChanges();
  }

  /** Smanjuje količinu (ako spadne na 1 i klikne se minus, pita za brisanje) */
  decrementCount(toy: any) {
    if (toy.count > 1) {
      AuthService.updateOrderCount(toy.toyId || toy.id, toy.count - 1);
    } else {
      this.removeOrder(toy);
    }
    this.cdr.detectChanges();
  }
}