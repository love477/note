import { generateNumberArr, selectionSort } from './sort';

const a = generateNumberArr();
console.log('before sort: ', a);
selectionSort(a)
console.log('after sort: ', a);