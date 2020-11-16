# Node

## C++ addons

### C++ addons简介

##### C++扩展简介

由于Node.js本身就是基于Chrome V8和libuv，使用C++开发的，所以Node是可以使用特定的API开发的C++代码的。使用C++扩展的两大理由：性能和开发成本。

##### 开发环境

node-gyp是Node.js下的C++扩展构建工具，是基于GYP（Generate Your Projects）来进行工作的，GYP是Google出品的一套构建工具，通过*.gyp描述文件生成需要的项目文件。node-gyp的描述文件是binding.gyp，常见的格式如下：

```py
{
    "targets": [
      {
        "target_name": "UlsAddon",
        "sources": [ "src/uls_addon.cpp", "src/uls.cpp" ],
        "libraries": ["../src/logsys_api/liblogsys_client.a"]
      }
    ]
 }
```

更多的binding.gyp文件参数，请参考[binding.gyp example](https://github.com/nodejs/node-gyp/wiki/%22binding.gyp%22-files-out-in-the-wild)

node-gyp命令：

| 命令      | 说明                                                         |
| --------- | ------------------------------------------------------------ |
| build     | Invokes `make` and builds the module                         |
| clean     | Removes any generated build files and the "out" dir          |
| configure | Generates a Makefile for the current module                  |
| rebuild   | Runs "clean", "configure" and "build" all at once            |
| install   | Install node development files for the specified node version |
| list      | Prints a listing of the currently installed node development files |
| remove    | Removes the node development files for the specified version |

运行node-gyp还需要Python和gcc的支持，通常Mac无需手动安装，但是如果出现Python或者gcc的版本问题还是需要手动解决，具体的安装方式自行google，这里就不多说明了。    
PS：升级gcc踩坑较多，这里有一个相对简单的升级指南：[为CentOS 6、7升级gcc至4.8、4.9、5.2、6.3、7.3等高版本](https://www.yuque.com/loveqq/cwh6py/weicentos-67sheng-jigcc-zhi4849526373deng-gao-ban)

##### vs code开发C++

安装C/C++扩展，安装之后vs code打开C++项目，发现无法导入对应的*.h文件，这是因为没有配置vs code的C++ includePath，vs code使用默认的路径查找头文件导致。打开vs code的设置（command + ,），找到C++扩展的设置，找到includePath的设置，在json文件中编辑：

```json
    "C_Cpp.default.includePath": [
        "/Users/admin/Library/Caches/node-gyp/8.9.0/include/node"
    ],
```

使用node-gyp安装的node源文件默认路径：

```sh
$HOME/Library/Caches/node-gyp
```

通过设置includePath方便我们切换不同版本的Node。

##### 安装.node包

使用[node-pre-gyp](https://www.npmjs.com/package/node-pre-gyp)
使用方式：  
1、 引入node-pre-gyp

```sh
npm i node-pre-gyp -D
```

2、package.json中增加npm script：install

```json
"scripts": {
    "install": "node-pre-gyp install --fallback-to-build"
  },
```

3、package.json中增加binary的定义：

```json
"binary": {
    "module_name": "your_module",
    "module_path": "./lib/binding/{node_abi}-{platform}-{arch}",
    "remote_path": "./node-addons/{module_name}/v{version}/",
    "package_name": "{node_abi}-{platform}-{arch}.tar.gz",
    "host": "https://gyp.futuoa.com"
  }
```

这里需要注意，node-pre-gyp使用的是https协议去下载.node文件的压缩包并解压到指定目录，所以host必须支持https。  
参数说明：

| 参数     | 解释                                                         |
| -------- | ------------------------------------------------------------ |
| node_abi | node C++ ABI number，node环境中process.versions.modules的值，可以在https://nodejs.org/zh-cn/download/releases/#ref-1查看Node版本对应node_abi，node-pre-gyp做了封装，形式为：node_v${modules} |
| arch     | 系统架构：x64、ia32                                          |
| platform | matches node's process.arch like x64 or ia32 unless the user passes the --target_arch option to override |

上面的binary定义仅作推荐，实际使用的binary定义可以参考官方文档自行定义

##### V8介绍

###### Isolate

在Chrome V8中，引擎实例的数据类型叫Isolate，全称：Isolate Instance。与别的Isolate Instance完全隔离，互不干扰。Isolate就是一个V8引擎实例，也可以理解为引擎本体。每个Isolate内部拥有完全独立的各种状态，如堆管理、垃圾回收等。

在进行C++扩展开发的时候，已经处于V8环境中，可以直接获取Isolate，常见的做法如下：

```C++
void Method(const v8::FunctionCallbackInfo<v8::Value> &args) {
  Isolate* isolate = args.GetIsolate();
  // ...
}
```

###### Context

Context定义了JavaScrip的t执行环境，创建的时候需要指定属于哪个实例：

```C++
void Method(const v8::FunctionCallbackInfo<v8::Value> &args) {
  v8::Isolate* isolate = args.GetIsolate();
  Local<Context> context = v8::Context::New(isolate);
  // Local<Context> context = ioslate->GetCurrentContext();
  // ...
}
```

###### Handle（句柄）

Handle：JavaScript数据对象在堆内存中的引用。

**Local(本地句柄)**

Local存在于栈内存中

**MaybeLocal(待实本地句柄)**

Local or empty

**Persistent(持久句柄)**

Persistent在堆内存

###### Template（模版）

Chrome V8的模版指的是在上下文中对JavaScript对象、函数的一个模具。使用模版将C++的函数或者数据结构包裹进JavaScript的对象中。



















