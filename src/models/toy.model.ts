export interface ToyModel {
    toyId: number;
    name: string;
    permalink: string;
    description: string;
    targetGroup: string;
    productionDate: string;
    price: number;
    imageUrl: string;
    
    // Podaci o uzrastu i tipu
    ageGroup: { ageGroupId: number; name: string; description: string; };
    type: { typeId: number; name: string; description: string; };

    // --- DODATNA POLJA ZA FUNKCIONALNOST ---
    status?: 'rezervisano' | 'pristiglo' | 'otkazano'; 

    /** * KLJUČNO: Ovo polje je falilo u tvom modelu. 
     * Sada ga dodajemo da bi terminal prestao da izbacuje Error.
     */
    rating?: number; 

    userRating?: number; 
    reviews?: { user: string; comment: string; rating: number; }[];
}