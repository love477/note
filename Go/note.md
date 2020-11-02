

# golang

建议阅读官方文档:https://golang.org/doc  
若英文限制，则参考其他的中文版本，中文版本注意文档的版本

## 开发前的准备

### 工作空间

Go的代码必须放在工作空间中，工作空间包含三个子目录：

- src Go源码
- pkg 包对象
- bin 可执行命令

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



## 并发编程
### goroutine
在go中，每一个并发的执行单元，叫做一个goroutine。

### channel



## gomod