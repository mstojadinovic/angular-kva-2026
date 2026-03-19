import { Component, signal, OnInit, ChangeDetectorRef } from '@angular/core'; // OnInit i ChangeDetectorRef su ključni za osvežavanje podataka
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { Alerts } from '../alerts';
import { MatListModule } from '@angular/material/list';
import { Utils } from '../utils';
import { ToyService } from '../../services/toy.service';

@Component({
  selector: 'app-user',
  standalone: true, // Komponenta je samostalna
  imports: [
    MatCardModule, MatInputModule, MatButtonModule,
    MatIconModule, FormsModule, MatListModule, MatSelectModule,
  ],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User implements OnInit { // Dodali smo 'implements OnInit' da bi Angular znao da koristi ngOnInit funkciju
  
  // Dohvatanje trenutno ulogovanog korisnika iz servisa
  public activeUser = AuthService.getActiveUser()
  
  // Signal koji čuva listu naziva igračaka za padajući meni u HTML-u
  favourites = signal<string[]>([])
  
  // Polja za promenu lozinke koja se vežu za formu preko [(ngModel)]
  oldPassword = ''
  newPassword = ''
  passRepeat = ''

  // Constructor služi za ubacivanje potrebnih alata (router, detektor promena...)
  constructor(
    private router: Router, 
    public utils: Utils, 
    private cdr: ChangeDetectorRef // Alat koji nam služi da nateramo ekran da se osveži
  ) {
    // Provera: Ako niko nije ulogovan, odmah ga šaljemo na login stranicu
    if (!this.activeUser) {
      this.router.navigate(['/login'])
      return
    }
  }

  /** * ngOnInit se izvršava odmah nakon što se stranica "nacrta".
   * Idealno mesto za dovlačenje podataka sa servera.
   */
  ngOnInit() {
    this.ucitajListuIgracaka();
  }

  /**
   * Poziva ToyService da dobije nazive igračaka sa servera.
   */
  ucitajListuIgracaka() {
    ToyService.getNames()
      .then(rsp => {
        // Ako su stigli podaci, upisujemo ih u signal
        this.favourites.set(rsp);
        
        // VEOMA BITNO: Ovim kažemo Angularu da "pogleda" opet u listu
        // jer su podaci stigli asinhrono. To sprečava poruku "Nema dostupnih igračaka".
        this.cdr.detectChanges(); 
      })
      .catch(err => {
        // U slučaju greške, ispisujemo je samo u konzoli da ne plašimo korisnika
        console.error('Info: Problem sa učitavanjem liste igračaka.', err);
      });
  }

  /** Kreira dinamičku sliku (avatar) koristeći ime i prezime korisnika */
  getAvatarUrl() {
    return `https://ui-avatars.com/api/?name=${this.activeUser?.firstName}+${this.activeUser?.lastName}`;
  }

  /** Funkcija za čuvanje osnovnih izmena (Ime, Prezime, Adresa, Telefon, Omiljena igračka) */
  updateUser() {
    if (!this.activeUser) return;
    
    Alerts.confirm('Da li ste sigurni da želite ažurirati informacije o korisniku?', () => {
        // Pozivamo AuthService da prepiše podatke u LocalStorage
        AuthService.updateActiveUser(this.activeUser!)
        Alerts.success('Izmene uspešno sačuvane')
        
        // Osvežavamo prikaz avatara ako je ime promenjeno
        this.cdr.detectChanges();
    })
  }

  /** * Logika za proveru i promenu lozinke korisnika.
   */
  updatePassword() {
    if (!this.activeUser) return;

    Alerts.confirm('Da li ste sigurni da želite da promenite lozinku?', () => {
        // 1. Provera da li je stara lozinka ispravno ukucana
        if (this.oldPassword != this.activeUser?.password) {
          Alerts.error('Neispravna stara lozinka')
          return
        }

        // 2. Provera da nova lozinka ne bude prekratka (bar 6 karaktera)
        if (this.newPassword.length < 6) {
          Alerts.error('Lozinka mora da sadrži najmanje 6 karaktera')
          return
        }

        // 3. Provera da li su polja 'Nova lozinka' i 'Ponovite' ista
        if (this.newPassword != this.passRepeat) {
          Alerts.error('Lozinke se ne podudaraju')
          return
        }

        // 4. Provera da korisnik nije ukucao istu lozinku kao staru
        if (this.newPassword == this.activeUser?.password) {
          Alerts.error('Nova lozinka ne može biti ista kao stara lozinka')
          return
        }

        // AKO PROĐU SVE PROVERE: Menjamo lozinku u bazi (LocalStorage)
        AuthService.updateActiveUserPassword(this.newPassword)
        Alerts.success('Lozinka uspešno ažurirana. Prijavite se ponovo.')
        
        // Logujemo korisnika napolje radi sigurnosti
        AuthService.logout()
        this.router.navigate(['/login'])
      })
  }
}