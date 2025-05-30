import { StaticImageData } from "next/image";

export type productType ={
    id: string;
    title: string;
    description: string;
    price: number;
    manga:string;
    imgSrc: string|StaticImageData;
    cathegory:string;
    infoProduct:string
}