# 浅析Node的单线程

我们都知道，Node是单线程的，连官方的说明文档都是这样说明的：

```
A Node.js app is run in a single process, without creating a new thread for every request.
```

但是，Node真的是单线程吗？我一直有这样的疑问。我们来看下Node的是否真的是单线程的。

首先我们启动一个Node程序：

```javascript
require('http').createServer((req, res) => {
  res.writeHead(200);
  res.end('Hello World');
}).listen(8000);
console.log('process id', process.pid);
```

启动Node应用后，我们使用top（top -pid xxxx）指令查看应用详情：

我们可以看到，启动的Node应用实际有7个线程，那这分别是什么线程呢？作用是什么呢？为了解决这个疑问，我们来看下Node的源码。