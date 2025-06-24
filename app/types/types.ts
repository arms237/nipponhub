import { StaticImageData } from "next/image";

export type VariantType = {
    id: string;
    name: string;
    imgSrc?: string;
    price?: number;  // Prix spécifique à cette variante (optionnel)
    stock?: number; // Disponibilité spécifique à cette variante (optionnel)
    originalPrice?: number; // Prix original avant promotion
    discountPercentage?: number; // Pourcentage de réduction
}

export type VariationOptionType = {
    id:string; 
    name: string;     // Nom de l'option (ex: "Couleur", "Taille")
    variants: VariantType[];
}

export interface cityType {
    id: string;
    name: string;
    country: string;
    created_at: string;
}

export interface productType {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number; // Prix original avant promotion
    discountPercentage?: number; // Pourcentage de réduction
    isOnSale?: boolean; // Si le produit est en promotion
    saleEndDate?: string; // Date de fin de promotion
    manga: string;
    imgSrc: string; // string pour l'URL de l'image
    imageFile?: File | null; // Fichier image temporaire pour l'upload
    category: string;
    sub_category?: string;
    infoProduct?: string;
    stock: number;
    variations?: VariationOptionType[]; // Tableau des options de variations disponibles
    country: string;
    available_cities?: string[]; // IDs des villes où le produit est disponible
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
    sold: number;   
}

export interface orderType{
    id: string;
    created_at: string;
    product_id: string;
    products?: productType;
    variant_id?: string;
    quantity: number;
    price: number;
    country?: string;
    admin_email?: string;
    admin_username?: string;
}
export interface ClientOrderForm {
    email: string;
    username: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    notes: string;
  };