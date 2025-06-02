import { StaticImageData } from "next/image";

export type VariantType = {
    id: string;
    name: string;
    value: string;
    imgSrc?: string | StaticImageData;
    price?: number;  // Prix spécifique à cette variante (optionnel)
    stock?: number; // Disponibilité spécifique à cette variante (optionnel)
}

export type VariationOptionType = {
    name: string;     // Nom de l'option (ex: "Couleur", "Taille")
    variants: VariantType[];
}

export interface productType {
    id: string;
    title: string;
    description: string;
    price: number;
    manga: string;
    imgSrc: string[] | StaticImageData[];
    cathegory: string;
    subCathegory?: string;
    infoProduct: string;
    stock: number;
    variations?: VariationOptionType[]; // Tableau des options de variations disponibles
}