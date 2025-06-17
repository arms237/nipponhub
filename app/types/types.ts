import { StaticImageData } from "next/image";

export type VariantType = {
    id: string;
    name: string;
    value: string;
    imgSrc?: string;
    price?: number;  // Prix spécifique à cette variante (optionnel)
    stock?: number; // Disponibilité spécifique à cette variante (optionnel)
}

export type VariationOptionType = {
    id:string; 
    name: string;     // Nom de l'option (ex: "Couleur", "Taille")
    variants: VariantType[];
}

export interface productType {
    id: string;
    title: string;
    description: string;
    price: number;
    manga: string;
    imgSrc: File|null;
    cathegory: string;
    subCathegory?: string;
    infoProduct?: string;
    stock: number;
    variations?: VariationOptionType[]; // Tableau des options de variations disponibles
    pays:string;
    created_at: string;
    updated_at: string;
}

export interface userType {
    id: string;
    username: string;
    email: string;
    phone: string;
    role: string;
    country: string;
}

export interface orderType{
    email:string;
    username:string;
    phone:string;
    address:string;
    city:string;
    country:string;//cameroun|gabon
    notes:string;
}