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

channel是goroutine之间的通信机制，一个channel是一个通信机制，它可以让一个goroutine通过该channel给另一个goroutine发送值消息。每一个channel都有一个特定的类型，如：chan int 表示可以发送int消息的channel。一般通过make创建一个channel：

```go
ch := make(chan int)
```

和map类似，channel也是一个make创建的底层数据结构的引用，零值为nil。创建channel时可以指定channel的缓存大小，默认无缓存：

```go
ch := make(chan int) // unbuffered channel
ch1 := make(chan int, 0) // unbuffered channel
ch2 := make(chan int, 3) // buffered channel with capacity 3
```

关闭channel：

```go
close(ch)
```

当一个channel被关闭后，再向该channel发送数据将导致panic异常。当一个被关闭的channel中已经发送的数据都被成功接收后，后续的接收操作将不再阻塞，它们会立即返回一个零值。

#### 无缓存channel

一个基于无缓存Channels的发送操作将导致发送者goroutine阻塞，直到另一个goroutine在相同的Channels上执行接收操作，当发送的值通过Channels成功传输之后，两个goroutine可以继续执行后面的语句。反之，如果接收操作先发生，那么接收者goroutine也将阻塞，直到有另一个goroutine在相同的Channels上执行发送操作。

基于无缓存Channels的发送和接收操作将导致两个goroutine做一次同步操作。因为这个原因，无缓存Channels有时候也被称为同步Channels。

#### 串联channel（pipeline）

Channels也可以用于将多个goroutine连接在一起，一个Channel的输出作为下一个Channel的输入。这种串联的Channels就是所谓的管道（pipeline）。

```go
func main() {
    naturals := make(chan int)
    squares := make(chan int)

    // Counter
    go func() {
        for x := 0; ; x++ {
            naturals <- x
        }
    }()

    // Squarer
    go func() {
        for {
            x := <-naturals
            squares <- x * x
        }
    }()

    // Printer (in main goroutine)
    for {
        fmt.Println(<-squares)
    }
}
```

#### 单方向channel

Go语言的类型系统提供了单方向的channel类型，分别用于只发送或只接收的channel。类型`chan<- int`表示一个只发送int的channel，只能发送不能接收。相反，类型`<-chan int`表示一个只接收int的channel，只能接收不能发送。（箭头`<-`和关键字chan的相对位置表明了channel的方向。）这种限制将在编译期检测。

因为关闭操作只用于断言不再向channel发送新的数据，所以只有在发送者所在的goroutine才会调用close函数，因此对一个只接收的channel调用close将是一个编译错误。

任何双向channel向单向channel变量的赋值操作都将导致该隐式转换。这里并没有反向转换的语法：也就是不能将一个类似`chan<- int`类型的单向型的channel转换为`chan int`类型的双向型的channel。例：

```go
func counter(out chan<- int) {
    for x := 0; x < 100; x++ {
        out <- x
    }
    close(out)
}

func squarer(out chan<- int, in <-chan int) {
    for v := range in {
        out <- v * v
    }
    close(out)
}

func printer(in <-chan int) {
    for v := range in {
        fmt.Println(v)
    }
}

func main() {
    naturals := make(chan int)
    squares := make(chan int)
    go counter(naturals) // 隐式转换
    go squarer(squares, naturals) // 隐式转换
    printer(squares) // 隐式转换
}
```

#### 带缓存的channel

带缓存的Channel内部持有一个元素队列。队列的最大容量是在调用make函数创建channel时通过第二个参数指定的。

```go
ch = make(chan string, 3)
```

向缓存Channel的发送操作就是向内部缓存队列的尾部插入元素，接收操作则是从队列的头部删除元素（FIFO队列）。如果内部缓存队列是满的，那么发送操作将阻塞直到因另一个goroutine执行接收操作而释放了新的队列空间。相反，如果channel是空的，接收操作将阻塞直到有另一个goroutine执行发送操作而向队列插入元素。

### select

C语言中的 select关键字可以同时监听多个文件描述符的可读或者可写的状态，Go中的select与C语言中的有着相似的功能。select关键字让goroutine同时等待多个Channel的可读或者可写，在多个文件或者Channel发生状态改变之前，一直阻塞当前线程或者goroutine。

