import figurineGoku from "./images/figurine-goku.jpg";
import pullBluelock from "./images/pull-bluelock.jpg";
import collierSnk1 from "./images/collierSNK-silver.jpg";
import collierSnk2 from "./images/collierSnk-gold.jpg";
import figurineGiraya from "./images/figurine-giraya.jpg";
import { productType } from "./types/types";

export const products: productType[] = [
  {
    id: "1",
    title: "Figurine Goku ssjblue",
    description:
      "Figurine Goku en resine de haute qualité parfait pour une collection et décoration d'intérieur bla bla bla",
    price: 15000,
    imgSrc: figurineGoku,
    cathegory: "figurines",
    infoProduct: "",
    manga: "Dragon Ball",
    stock: 0,
    pays:'Cameroun'
  },
  {
    id: "2",
    title: "Pull blue lock",
    description: "Pull blue lock",
    price: 12000,
    imgSrc: pullBluelock,
    cathegory: "vetements",
    subCathegory: "pulls",
    infoProduct: "",
    manga: "Blue Lock",
    stock: 3,
    pays:'Cameroun'
  },
  {
    id: "3",
    title: "Collier SNK",
    description: "Collier SNK",
    price: 1500,
    imgSrc: collierSnk1,
    cathegory: "bijoux",
    subCathegory: "colliers",
    infoProduct:
      "Collier inspiré de la série Attack on Titan (Shingeki no Kyojin). Disponible en version argent et or.",
    manga: "SNK",
    stock: 2,
    variations: [
      {
        name: "Couleur",
        variants: [
          {
            id: "color-silver",
            name: "Argent",
            value: "silver",
            imgSrc: collierSnk1,
            stock: 1,
          },
          {
            id: "color-gold",
            name: "Or",
            value: "gold",
            imgSrc: collierSnk2,
            price: 1700,
            stock: 1,
          },
        ],
      },
    ],
    pays:'Cameroun'
  },
  {
    id: "4",
    title: "Figurine Jiraya",
    description: "Figurine Jiraya",
    price: 8000,
    imgSrc: figurineGiraya,
    cathegory: "figurines",
    infoProduct: "",
    manga: "Naruto",
    stock: 1,
    pays:'Cameroun'
  },
  {
    id: "5",
    title: "Figurine Goku",
    description: "Figurine Goku",
    price: 10000,
    imgSrc: figurineGoku,
    cathegory: "figurines",
    infoProduct: "",
    manga: "Dragon Ball",
    stock: 1,
    pays:'Cameroun'
  },
  {
    id: "6",
    title: "Figurine Goku",
    description: "Figurine Goku",
    price: 10000,
    imgSrc: figurineGoku,   
    cathegory: "figurines",
    infoProduct: "",
    manga: "Dragon Ball",
    stock: 1,
    pays:'Cameroun'
  },
  {
    id: "7",
    title: "Figurine Goku",
    description: "Figurine Goku",
    price: 10000,
    imgSrc: figurineGoku,
    cathegory: "figurines",
    infoProduct: "",
    manga: "Dragon Ball",
    stock: 0,
    pays:'Cameroun'
  },
  {
    id: "8",
    title: "Figurine Goku",
    description: "Figurine Goku",
    price: 10000,
    imgSrc: figurineGoku,
    cathegory: "figurines",
    infoProduct: "",
    manga: "Dragon Ball",
    stock: 1,
    pays:'Cameroun'
  },
  {
    id: "9",
    title: "Figurine Goku",
    description: "Figurine Goku",
    price: 20000,
    imgSrc: figurineGoku,
    cathegory: "figurines",
    infoProduct: "",
    manga: "Dragon Ball",
    stock: 1,
    pays:'Gabon'
  },{
    id: "10",
    title: "Figurine Jiraya",
    description: "Figurine Jiraya",
    price: 18000,
    imgSrc: figurineGiraya,
    cathegory: "figurines",
    infoProduct: "",
    manga: "Naruto",
    stock: 1,
    pays:'Gabon'
  },
];
