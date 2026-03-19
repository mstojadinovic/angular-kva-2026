import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ToyService } from '../../services/toy.service';
import { Router, RouterLink } from "@angular/router";
import { MatSelectModule } from '@angular/material/select';
import { UserModel } from '../../models/user.model';
import { Alerts } from '../alerts';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common'; // Dodato za osnovne direktive

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatInputModule, MatButtonModule,
    MatIconModule, FormsModule, RouterLink, MatSelectModule
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  // Inicijalizacija praznog korisnika
  user: Partial<UserModel> = {
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    password: '',
    favouriteToy: ''
  }

  repeat: string = '' // Polje za ponovljenu lozinku
  favourites = signal<string[]>([]) // Lista igračaka za padajući meni

  constructor(public router: Router) {
    // Punimo listu omiljenih igračaka iz ToyService-a
    ToyService.getNames().then(rsp => this.favourites.set(rsp))
  }

  /**
   * GLAVNA FUNKCIJA ZA REGISTRACIJU
   */
  doSignup() {
    // 1. PROVERA DUPLIKATA: Pozivamo funkciju koju smo dodali u AuthService
    // Ovo rešava crvenu grešku sa tvoje slike
    if (AuthService.existsByEmail(this.user.email!)) {
      Alerts.error('Greška: Email adresa je već zauzeta! Probajte drugu.');
      return;
    }

    // 2. PROVERA PRAZNIH POLJA
    if (!this.user.email || !this.user.firstName || !this.user.lastName || !this.user.address) {
      Alerts.error('Sva polja moraju biti popunjena!');
      return;
    }

    // 3. PROVERA DUŽINE LOZINKE
    if (this.user.password!.length < 6) {
      Alerts.error('Lozinka mora imati najmanje 6 karaktera!');
      return;
    }

    // 4. PROVERA POKLAPANJA LOZINKI
    if (this.user.password !== this.repeat) {
      Alerts.error('Lozinke se ne poklapaju!');
      return;
    }

    // 5. SNIMANJE: Ako je sve u redu, pravimo korisnika i idemo na login
    console.log("Registracija uspešna za:", this.user.email);
    AuthService.createUser(this.user);
    
    Alerts.success('Uspešno ste se registrovali! Sada se možete ulogovati.');
    this.router.navigate(['/login']);
  }
}