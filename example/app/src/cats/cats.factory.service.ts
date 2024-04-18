import { Injectable } from '@nestjs/common';
import { Cat } from './schemas/cat.schema';

export interface CatsFactoryProps {
  cat?: Cat;
}

const RANDOM_COLORS = ['black', 'white', 'orange', 'gray', 'brown'];
const RANDOM_NAMES = ['Tom', 'Jerry', 'Garfield', 'Felix', 'Sylvester'];
const RANDOM_AGE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

@Injectable()
export class CatsFactoryService {
  constructor() {}

  generate(props: CatsFactoryProps = {}) {
    const randomCat = {
      name: RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)],
      color: RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)],
      age: RANDOM_AGE[Math.floor(Math.random() * RANDOM_AGE.length)],
    };

    return {
      ...randomCat,
      ...props?.cat,
    };
  }
}
