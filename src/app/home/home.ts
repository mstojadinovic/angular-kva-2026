import { Component, signal } from '@angular/core';
import axios from 'axios';
import { ToyModel } from '../../models/toy.model';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  toys = signal<ToyModel[]>([])

  constructor(){
    axios.get('https://toy.pequla.com/api/toy')
    .then(rsp=>this.toys.set(rsp.data)) 
    //.then(rsp=>this.toys.set(JSON.stringify(rsp.data, null, 2)))    //ovo prikazuje sve elemente api-a
  }
}
