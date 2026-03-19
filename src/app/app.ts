import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router'; 
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  // Imports niz: Ovde dodajemo module da bi ih Angular prepoznao u HTML-u
  imports: [
    CommonModule,     // Omogućava korišćenje @if i @else logike u HTML-u
    RouterOutlet,     // Mesto gde se prikazuju različite stranice (home, cart, login)
    RouterLink,       // Omogućava da klik na dugme "Korpa" promeni stranicu
    MatButtonModule,  // Angular Material dizajn za dugmiće
    MatMenuModule,    // Omogućava padajući meni za mobilnu verziju
    MatToolbarModule, // Gornja traka (navbar)
    MatIconModule     // OBAVEZNO: Omogućava prikaz ikonice shopping_cart
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Automatski uzimamo trenutnu godinu za footer
  year = new Date().getFullYear();
  
  // Signal za naslov projekta (moderniji Angular pristup)
  protected readonly title = signal('AM² - 2026');
  
  // Povezujemo AuthService sa HTML-om da bismo proverili da li je korisnik ulogovan
  public authService = AuthService;

  // Router nam treba da bismo mogli da prebacimo korisnika na login nakon odjave
  constructor(private router: Router) { }

  // Funkcija za odjavu korisnika
  doLogout() {
    // Pozivamo metodu iz servisa koja briše podatke iz session/local storage-a
    AuthService.logout();
    // Vraćamo korisnika na login stranicu
    this.router.navigate(['/login']);
  }
}