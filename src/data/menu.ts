type Ingredient = {
  name: string;
  weight: number;
};

export type SushiMenu = {
  name: string;
  ingredients: Ingredient[];
};

export const menu: SushiMenu[] = [
  {
    name: "マグロ",
    ingredients: [
      { name: "シャリ", weight: 15 },
      { name: "マグロ", weight: 10 },
    ],
  },
  {
    name: "ネギトロ",
    ingredients: [
      { name: "シャリ", weight: 15 },
      { name: "マグロ", weight: 10 },
      { name: "ネギ", weight: 2 },
    ],
  },

  {
    name: "卵",
    ingredients: [
      { name: "シャリ", weight: 15 },
      { name: "タマゴ", weight: 20 },
    ],
  },
];
