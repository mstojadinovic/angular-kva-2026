export interface ToyModel {

    
    toyId: number
    name: string
    permalink: string
    description: string
    targetGroup: string
    productionDate: string
    price: number //null
    imageUrl: string
    ageGroup: {
        ageGroupId: number  //null
        name: string
        description: string
    },
    type: {
        typeId: number //null
        name: string
        description: string
    }

}