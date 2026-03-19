import { Injectable } from '@angular/core';
import { UserModel } from "../models/user.model"

const USERS = 'users'
const ACTIVE = 'active'
const GLOBAL_RATINGS = 'local_ratings' // Ključ u memoriji pregledača za sve ocene

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor() { }

  /** * Preuzima sve registrovane korisnike iz memorije. 
   * Ako je prazno, pravi inicijalnog test korisnika.
   */
  static getUsers(): UserModel[] {
    const baseUser: UserModel = {
      email: 'user@example.com',
      password: 'user123',
      favouriteToy: 'Drvena slagalica životinje',
      firstName: 'Primer',
      lastName: 'Korisnik',
      phone: '060123456',
      address: 'Ulica 1',
      orders: []
    }
    if (localStorage.getItem(USERS) == null) {
      localStorage.setItem(USERS, JSON.stringify([baseUser]))
    }
    return JSON.parse(localStorage.getItem(USERS)!)
  }

  /** Proverava da li korisnik sa unetim email-om već postoji */
  static existsByEmail(email: string): boolean {
    const users = this.getUsers();
    return users.some(u => u.email === email);
  }

  /** Proverava kredencijale i postavlja email u 'active' sesiju */
  static login(email: string, password: string) {
    const users = this.getUsers()
    for (let u of users) {
      if (u.email === email && u.password === password) {
        localStorage.setItem(ACTIVE, email)
        return true
      }
    }
    return false
  }

  /** Vraća podatke trenutno ulogovanog korisnika */
  static getActiveUser(): UserModel | null {
    const users = this.getUsers()
    const activeEmail = localStorage.getItem(ACTIVE)
    return users.find(u => u.email === activeEmail) || null;
  }

  /** Menja lozinku trenutno aktivnom korisniku */
  static updateActiveUserPassword(newPassword: string) {
    const user = this.getActiveUser();
    if (user) {
      user.password = newPassword;
      this.updateActiveUser(user);
    }
  }

  /** * Glavna metoda za ažuriranje podataka korisnika u listi svih korisnika.
   * Koristi se za snimanje narudžbina, promena profila itd.
   */
  static updateActiveUser(newUserData: UserModel) {
    const users = this.getUsers()
    const activeEmail = localStorage.getItem(ACTIVE)
    const idx = users.findIndex(u => u.email === activeEmail);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...newUserData };
      localStorage.setItem(USERS, JSON.stringify(users));
    }
  }

  /** Menja količinu artikla u korpi */
  static updateOrderCount(toyId: number, newCount: number) {
    const user = this.getActiveUser();
    if (user && user.orders) {
      const idx = user.orders.findIndex((o: any) => o.toyId === toyId);
      if (idx !== -1) {
        user.orders[idx].count = newCount;
        this.updateActiveUser(user); 
      }
    }
  }

  /** * Ažurira ocenu unutar same narudžbine (u korpi).
   * Automatski poziva updateGlobalRating kako bi se promena videla na Home i Order strani.
   */
  static updateOrderRating(toyId: number, newRating: number) {
    const user = this.getActiveUser();
    if (user && user.orders) {
      const idx = user.orders.findIndex((o: any) => o.toyId === toyId);
      // Ocenjivanje radi samo ako je status 'pristiglo'
      if (idx !== -1 && user.orders[idx].status === 'pristiglo') {
        user.orders[idx].rating = newRating;
        this.updateActiveUser(user);
        
        // SINHRONIZACIJA: Šaljemo ocenu u globalnu bazu ocena
        this.updateGlobalRating(toyId, newRating);
      }
    }
  }

  /** * KLJUČNA METODA: Čuva ocenu u posebnu mapu [toyId]: rating.
   * Ovo omogućava da Home strana zna koju ocenu da prikaže za određenu igračku.
   */
  static updateGlobalRating(toyId: number, newRating: number) {
    // Uzimamo postojeće ocene ili pravimo novi prazan objekat
    let ratings = JSON.parse(localStorage.getItem(GLOBAL_RATINGS) || '{}');
    // Upisujemo novu ocenu pod ključem ID-a igračke
    ratings[toyId] = newRating;
    // Vraćamo nazad u localStorage
    localStorage.setItem(GLOBAL_RATINGS, JSON.stringify(ratings));
  }

  /** * KLJUČNA METODA: Vraća ocenu za određenu igračku.
   * Ako korisnik nikada nije ocenio ovu igračku, vraća podrazumevanih 3.0.
   */
  static getLocalRating(toyId: number): number {
    let ratings = JSON.parse(localStorage.getItem(GLOBAL_RATINGS) || '{}');
    // Ako postoji ocena u bazi vrati nju, u suprotnom vrati 3.0
    return ratings[toyId] !== undefined ? ratings[toyId] : 3.0;
  }

  /** Registracija novog korisnika */
  static createUser(user: Partial<UserModel>) {
    const users = this.getUsers();
    user.orders = [];
    users.push(user as UserModel);
    localStorage.setItem(USERS, JSON.stringify(users));
  }

  /** Trajno brisanje narudžbine iz korpe */
  static deleteOrderPermanently(toyId: number) {
    const user = this.getActiveUser();
    if (user && user.orders) {
      user.orders = user.orders.filter((o: any) => o.toyId !== toyId);
      this.updateActiveUser(user);
    }
  }

  /** Simulacija dostave: postavlja sve narudžbine na status 'pristiglo' */
  static markOrdersAsArrived() {
    const user = this.getActiveUser();
    if (user && user.orders) {
      user.orders.forEach((o: any) => o.status = 'pristiglo');
      this.updateActiveUser(user);
    }
  }

  /** Provera da li je iko ulogovan */
  static isLoggedIn(): boolean { return localStorage.getItem(ACTIVE) !== null; }
  
  /** Odjava korisnika */
  static logout() { localStorage.removeItem(ACTIVE); }
}