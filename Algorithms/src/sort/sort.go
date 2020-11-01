package sort

import "fmt"

// SelectionSort 选择排序
func SelectionSort(input []int) {
	for i := 0; i < len(input); i++ {
		max := input[i]
		index := i
		for j := 0; j < len(input)-i; j++ {
			if input[j] > max {
				max = input[j]
				index = j
			}
		}
		input[index] = input[len(input)-i]
		input[len(input)-i] = max
	}
	fmt.Println("sort success!")
}
