# golang

建议阅读官方文档:https://golang.org/doc  
若英文限制，则参考其他的中文版本，中文版本注意文档的版本

## 开发前的准备

### 工作空间

Go的代码必须放在工作空间中，工作空间包含三个子目录：

- src Go源码
- pkg 包对象
- bin 可执行命令

#### go mod介绍



### 环境变量

选择好工作空间后，需要设置go的环境变量GOPATH（GOPATH不能和Go的安装目录相同，否则会影响包的加载）

```sh
# workspace指你选择的工作空间的路径，如：/Users/admin/work
export GOPATH=workspace
export GOBIN=$GOPATH/bin
```

设置GOPATH非常重要，之后在工作空间中编写的代码build、install指令生产的产物都会输出到工作空间的目录中（build的产物在pkg目录，install的产物在bin目录中）。若是用户没有设置GOPATH则会放到默认的文件夹中：$HOME/go或%USERPROFILE%\go。

若是想全局直接执行自己编写的go程序，则需要添加工作空间中的bin目录到path中：

```sh
# 执行下面的指令或者手动修改配置文件 ~/.zshrc or ~/.bashrc
export PATH=$GOPATH/bin
```

### 安装

说明了工作空间和环境变量这两个go开发的基本概念后，我们开始安装go。示例主要示mac，其他环境参考[官网的介绍](https://golang.org/doc/install)。

1. [官网](https://golang.org/dl/)下载安装包
2. 安装
3. 设置环境变量

```sh
# 使用zsh的示例
# 若使用的是bash，则编辑~/.bashrc文件
vim ~/.zshrc
# 在PATH后添加go的path，mac的默认安装路径是：/usr/local/go/
export PATH=$HOME/bin:/usr/local/bin:/usr/local/go/bin:$PATH

# 使配置生效
source ~/.zshrc
```

### go工具介绍



## 数据类型

### 数组



### slice



### json



## 函数

### 可变参数

在声明函数的时候，在参数列表的最后一个参数类型前加上...，表示该函数可以接受任意数量的该类型参数。

```go
func Sum(values ...int) int {
	sum := 0
	for _, val := range values {
		sum += val
	}
	return sum
}
```



### Deferred函数

defer定义的函数调用会在函数执行完/Panic异常退出前执行，主要的用途是确保函数执行完后资源被释放，也可以用于Panic异常的捕获处理。若是在同一个函数中定义了多个defer，则按照LIFO（Last In First Out）的顺序执行定义的defer。例：

```go
for i := 0; i < 5; i++ {
    defer fmt.Printf("%d ", i)
}
// 最终的输出为：4 3 2 1 0
```

### Panic异常

Go的运行时错误（数组越界、空指针等）会引起Panic异常，当发生Panic异常时，程序会中断执行，并立即执行该goroutine中的延迟函数（defer）。除了运行时会触发Panic异常，也可以手动调用panic函数触发Panic异常。

### Recover捕获异常





## 并发编程

### goroutine

在go中，每一个并发的执行单元，叫做一个goroutine。

### channel

### select

C语言中的 select关键字可以同时监听多个文件描述符的可读或者可写的状态，Go中的select与C语言中的有着相似的功能。select关键字让goroutine同时等待多个Channel的可读或者可写，在多个文件或者Channel发生状态改变之前，一直阻塞当前线程或者goroutine。