# 算法

## 排序算法

### 初级排序算法

#### 选择排序（冒泡法）

```typescript
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
  }
}
```

算法分析：



