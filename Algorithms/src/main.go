package src

import "fmt"
import "algorithms/sort"

func main() {
	input := []int{1, 4, 6, 22, 11, 23, 12, 10, 8, 5, 9, 13}
	sort.SelectionSort(input)
	fmt.Println("Hello")
}
