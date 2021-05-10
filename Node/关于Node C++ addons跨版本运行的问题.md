# 关于Node C++ addons跨版本运行的问题
## 现状
目前Node开发中使用的一些addons包不能跨Node版本运行，即每一个Node版本都需要一个特定的包。带来的问题：
1. 由于打包机器和目标机器（测试机器、线上机器）Node版本不一致，导致打包机器构建的产物无法在目标机器正常运行
2. 维护的问题，对这类的扩展新增功能、支持更新的Node版本，都需要兼容历史版本，是一个很沉重的历史包袱  

## 原因

由于现在的c++ addons是直接使用了node底层原生库实现，即直接使用node.h、libuv.h、v8.h等底层原生C++库实现的（历史悠久，4、5年前的代码）。众所周知啊，Node的版本更新速度那简直是做火箭般的速度，所以底层库的变动是十分的频繁，尤其是node.h和v8.h，这就导致了，使用了node底层原生库实现的addons对新版本很不友好，可能是不兼容，甚至之前使用的API在新版本中直接废弃/移除，导致addons无法在新版本中运行。
## 解决办法
对于上述的问题，Node官方已经给出了解决方案：[N-API](https://nodejs.org/dist/latest-v14.x/docs/api/n-api.html)。官方对N-API的说明：
**N-API (pronounced N as in the letter, followed by API) is an API for building native Addons. It is independent from the underlying JavaScript runtime (for example, V8) and is maintained as part of Node.js itself. This API will be Application Binary Interface (ABI) stable across versions of Node.js. It is intended to insulate Addons from changes in the underlying JavaScript engine and allow modules compiled for one major version to run on later major versions of Node.js without recompilation. The [ABI Stability](https://nodejs.org/en/docs/guides/abi-stability/) guide provides a more in-depth explanation.** 这是官方文档的原话，大致的意思就是说N-API提供了一种独立于JS底层运行时（如：v8）的addons开发方式，在不同的版本中都能保证稳定性，并且N-API作为Node.js的一部分内容而被官方进行维护。N-API的主要目标是：
- 提供稳定的ABI接口
- 消除Node版本差异
- 消除JS引擎差异

所以我们使用N-API开发addons能解决上述的问题。
## 后续问题
由于N-API的支持也是从10.x才开始的，所以对于<10.x的版本是无法使用N-API解决这个问题的。所以这边的做法是对于>=10.x的版本使用新版本的工具（这边的新版本会升级major版本号），对于<10.x的版本还是采用之前的方式，不做变化，但是推荐升级机器的Node版本到10.x。
目前内部的Node服务使用的版本大部分是>=10.x的，只有少部分遗留的服务还在使用低版本的Node，所以升级的影响不会很大。
