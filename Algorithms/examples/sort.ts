export function generateNumberArr(length = 10, min = 1, max = 100): number[] {
  const result = new Array<number>();
  for (let i = 0; i < length; i++) {
    const random = Math.ceil(Math.random() * max);
    result.push(random)
  }
  return result;
}

export function selectionSort(a: number[]) {
  if (!a || a.length < 2) {
    return;
  }
  for (let i = 0; i < a.length; i++) {
    let min = a[i];
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < min) {
        a[i] = a[j];
        a[j] = min;
        min = a[i];
      }
    }
    console.log(a);
  }
}