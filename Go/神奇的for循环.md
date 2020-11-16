# 神奇的for循环

注意下面的例子。

## 例一

```go
func main() {
	arr := []int{1, 2, 3}
	for _, v := range arr {
		arr = append(arr, v)
	}
	fmt.Println(arr)
}
```

思考：上面的代码的输出是什么？为什么？

答： 我们在遍历切片时追加的元素不会增加循环的执行次数，所以循环最终还是停了下来。

## 例二

```go
func main() {
	arr := []int{1, 2, 3}
	newArr := []*int{}
	for _, v := range arr {
		newArr = append(newArr, &v)
	}
	for _, v := range newArr {
		fmt.Println(*v)
	}
}
```

思考：上面的例子的输出是什么？为什么？

答：输出是：3，3，3。变量v在for循环期间都是一个临时变量，在循环开始时初始化，之后v的地址不再变化，即初始化的时候给v分配地址，后续只是改变v的值为arr数组中的值，v只是作为临时变量。所以&v的值一直都是同一个。对于上面的例子，在循环结束时，v的值为3，所以newArr中的数据为：[3, 3, 3]。