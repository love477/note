

# Redis为什么选择单线程模型

官方在Redis的FAQ中有回答这个问题：

It's not very frequent that CPU becomes your bottleneck with Redis, as usually Redis is either memory or network bound. For instance, using pipelining Redis running on an average Linux system can deliver even 1 million requests per second, so if your application mainly uses O(N) or O(log(N)) commands, it is hardly going to use too much CPU.

原文：https://redis.io/topics/faq 在Redis is single threaded. How can I exploit multiple CPU / cores? 小节。

结合我对Redis的了解，总结了下面几条原因：

1. Redis服务CPU不会是服务的瓶颈，使用pipeline技术，在普通的linux机器可以达到1000000 request/second(官方数据)
2. 单线程模型更加简单，降低了开发和后续的维护的成本
3. 同时，由于是单线程，也就没有了上下文切换、同步锁等多线程下的开销

总之Redis之所以是单线程，是多方权衡后的结果，但是后续的Rediis版本还是会加入多线程的设计或者已经加入了多线程的设计，具体如下：

1. Redis v4.0（引入多线程处理异步任务）
2. Redis v6.0（正式在网络模型中实现 I/O 多线程）

所以，现在说Redis是单线程，其实不太准确，但是Redis最初单线程的设计思想还是值得我们借鉴的。

