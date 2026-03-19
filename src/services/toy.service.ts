import axios from "axios";
import { ToyModel } from "../models/toy.model";

// Kreiranje Axios klijenta - ovde definišemo kako pričamo sa serverom
const client = axios.create({
    // Osnovna adresa tvog API-ja
    baseURL: 'https://toy.pequla.com/api', 
    headers: {
        'Accept': 'application/json',
        'X-Name': 'KVA_2026/dev' // Tvoj jedinstveni ključ za pristup
    },
    // Dozvoljavamo status 200 (uspeh) i 204 (uspeh, ali prazno) 
    // Ovo sprečava onaj crveni "AxiosError" prozor na ekranu
    validateStatus(status) {
        return status === 200 || status === 204;
    }
})

export class ToyService {
    
    /** * Dobavlja sve igračke. 
     * Koristimo '/toy/' jer ta putanja na tvom serveru provereno radi.
     */
    static async getToys() {
        return await client.get<ToyModel[]>('/toy/')
    }

    /** Dobavlja detalje o jednoj igrački preko njenog ID-a */
    static async getToyById(id: number) {
        return await client.get<ToyModel>('/toy/' + id)
    }

    /** Dobavlja listu igračaka za one ID-eve koji su u korpi */
    static async getToysByIds(ids: number[]) {
        // Šaljemo niz ID-eva serveru da nam vrati samo te igračke
        return await client.post<ToyModel[]>('/toy/list', ids);
    }

    /** * KLJUČNA FUNKCIJA ZA PROFIL (User stranicu):
     * Dobavlja samo imena igračaka za onaj padajući meni.
     */
    static async getNames() {
        try {
            // MENJAMO PUTANJU: Umesto '/toy/list' idemo na '/toy/' 
            // jer '/toy/list' tvoj server vidi kao praznu (status 204)
            const response = await client.get('/toy/');
            
            // Ako je odgovor 204 (No Content) ili nema podataka, vraćamo prazan niz
            if (response.status === 204 || !response.data) {
                console.warn("Upozorenje: API nije vratio nijednu igračku.");
                return [];
            }
            
            // Pošto '/toy/' vraća ceo objekat igračke, ovde uzimamo samo polje 'name'
            // .map ide kroz svaku igračku i izvlači njeno ime u novi niz
            return response.data.map((toy: any) => toy.name);

        } catch (error) {
            // Ako internet pukne ili se desi druga greška, ispiši u konzolu (F12)
            console.error("Greška u ToyService.getNames:", error);
            return [];
        }
    }
}