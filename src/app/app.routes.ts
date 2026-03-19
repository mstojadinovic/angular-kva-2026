import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { Details } from './details/details';
import { Login } from './login/login';
import { Cart } from './cart/cart';
import { Order } from './order/order';
import { User } from './user/user';
import { Signup } from './signup/signup';

export const routes: Routes = [

    
    // Početna stranica
    { path: '', component: Home },
    
    // O stranici
    { path: 'about', component: About },
    
    // Detalji igračke - koristi :toyId da bi znao koja je igračka u pitanju
    { path: 'details/:toyId', component: Details },
    
    // Stranica za naručivanje - :id je obavezan da bi "Book now" radio
    { path: 'order/:id', component: Order },
    
    // Korpa sa rezervacijama
    { path: 'cart', component: Cart },
    
    // Korisnički nalog i autentifikacija
    { path: 'login', component: Login },
    { path: 'signup', component: Signup },
    { path: 'user', component: User },

    // Ako korisnik ukuca nepostojeću adresu, vrati ga na početnu
    { path: '**', redirectTo: '' }
];