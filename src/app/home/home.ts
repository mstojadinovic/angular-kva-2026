import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { RouterLink } from "@angular/router";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms'; 
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common'; 
import axios from 'axios';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink, MatButtonModule, MatCardModule, MatIconModule,
    FormsModule, MatInputModule, MatSelectModule, MatFormFieldModule, CommonModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit { 
  public authService = AuthService;
  
  allToys: any[] = []; 

  // Polja za filtriranje i pretragu
  pretraga: string = '';        
  izabraniTip: string = '';     
  izabraniUzrast: string = '';  
  izabraniPol: string = ''; 
  maksCena: string = '';

  // Filter za minimalnu ocenu (inicijalno 0)
  minOcena: number = 0;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.ucitajSveIgracke();
  }

  /** * NOVO: Ova metoda se brine da se ocene osveže čim se korisnik vrati na početnu.
   * Ako ne koristiš Ionic, pozivaj je unutar navigacionih događaja.
   */
  osveziOcene() {
    this.allToys = this.allToys.map(t => {
      return {
        ...t,
        // Ponovo čitamo iz servisa jer je kupac možda promenio ocenu u korpi
        rating: AuthService.getLocalRating(t.id || t.toyId)
      };
    });
    this.cdr.detectChanges();
  }

  /** Povlači sve igračke sa API-ja i dodeljuje im početne ocene */
  ucitajSveIgracke() {
    axios.get('https://toy.pequla.com/api/toy/').then(rsp => {
      this.allToys = rsp.data.map((t: any, i: number) => {
        const uzrasti = ['0-2', '3-5', '6-9', '10+'];
        const naziv = t.name?.toLowerCase() || "";
        
        // Logika za određivanje pola na osnovu ključnih reči u nazivu
        let polKategorija = 'unisex'; 

        if (naziv.includes('superheroj') || naziv.includes('vatrogasni') || 
            naziv.includes('automobil') || naziv.includes('dinosaurusa') || 
            naziv.includes('traktor') || naziv.includes('kamion') || 
            naziv.includes('policijska')) {
          polKategorija = 'male';
        } 
        else if (naziv.includes('panda') || naziv.includes('princeze') || 
                 naziv.includes('mačka') || naziv.includes('jednorog') || 
                 naziv.includes('plišana')) {
          polKategorija = 'female';
        } 

        /** * DINAMIČKA OCENA: 
         * Pozivamo getLocalRating. Ako u localStorage nema ništa, vratiće 3.0.
         * Ako je kupac ocenio u korpi, ovde će se automatski učitati ta nova ocena.
         */
        const ocena = AuthService.getLocalRating(t.id || t.toyId);

        return {
          ...t,
          prikazUzrasta: t.age?.uzrast || t.age?.name || uzrasti[i % 4],
          tacanPol: polKategorija,
          rating: ocena // Ključno polje za prikaz zvezdica u home.html
        };
      });

      this.cdr.detectChanges();

    }).catch(err => {
      console.error("Greška pri učitavanju igračaka sa servera:", err);
    });
  }

  /** Get metoda koja vraća listu igračaka filtriranu po svim kriterijumima */
  get filtriraneIgracke() {
    return this.allToys.filter((t: any) => {
      const p = this.pretraga.toLowerCase();
      
      const matchesTekst = !p || (t.name?.toLowerCase().includes(p)) || (t.description?.toLowerCase().includes(p));
      const matchesTip = !this.izabraniTip || t.type?.name === this.izabraniTip;
      const matchesUzrast = !this.izabraniUzrast || t.prikazUzrasta === this.izabraniUzrast;
      const matchesPol = !this.izabraniPol || t.tacanPol === this.izabraniPol;
      
      const cenaStr = t.price.toString();
      const matchesCena = !this.maksCena || cenaStr.startsWith(this.maksCena);

      // Filter sada radi ispravno jer prati lokalnu ocenu (rating)
      const matchesOcena = (t.rating || 3.0) >= this.minOcena;

      return matchesTekst && matchesTip && matchesUzrast && matchesPol && matchesCena && matchesOcena;
    });
  }

  getUzrastSaSlikom() {
    return [
      { id: '0-2', label: '0-2 god.', ikona: 'child_care' },
      { id: '3-5', label: '3-5 god.', ikona: 'face' },
      { id: '6-9', label: '6-9 god.', ikona: 'school' },
      { id: '10+', label: '10+ god.', ikona: 'sports_esports' }
    ];
  }

  getTipovi() {
    return [...new Set(this.allToys.map((t: any) => t.type?.name).filter((n: any) => n))];
  }

  ponistiSve() {
    this.pretraga = ''; 
    this.izabraniTip = ''; 
    this.izabraniUzrast = ''; 
    this.izabraniPol = ''; 
    this.maksCena = '';
    this.minOcena = 0; 
    this.cdr.detectChanges(); 
  }
}