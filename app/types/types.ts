
export type VariantType = {
    id: string;
    name: string;
    img_src?: string;
    price?: number;  // Prix spécifique à cette variante (optionnel)
    stock?: number; // Disponibilité spécifique à cette variante (optionnel)
    original_price?: number; // Prix original avant promotion
    discount_percentage?: number; // Pourcentage de réduction
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
    original_price?: number; // Prix original avant promotion
    discount_percentage?: number; // Pourcentage de réduction
    is_on_sale?: boolean; // Si le produit est en promotion
    sale_end_date?: string; // Date de fin de promotion
    manga: string;
    img_src: string; // string pour l'URL de l'image
    image_file?: File | null; // Fichier image temporaire pour l'upload
    category: string;
    sub_category?: string;
    info_product?: string;
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

export interface CartItem {
    id: string;
    title: string;
    img_src?: string;
    price: number;
    quantity: number;
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
    // Champs spécifiques pour la commande client
    username?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    notes?: string;
    cart_items?: CartItem[];
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

export interface Promotion{
    id: string;
    title: string;
    sale_end_date: string;
    discount_percentage: number;
}