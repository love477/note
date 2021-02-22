# Node addons简介

Node adons是有C++编写的动态链接库，是对Node能力的扩展。通过“特定”的方式实现功能，然后编译成.node文件，Node的require()方法可以直接加载.node文件到代码中使用。目前有三种方式可以实现addons，分别是：**使用N-API**、**nan**、**直接使用底层的库（v8、libuv、node相关的库）**，下面简单说下三种方式。

## 直接使用底层的库实现addons

Node底层是有C/C++实现的，基本的能力有v8、libuv提供，而v8和libuv也是C/C++的库，所以我们是可以直接使用v8、libuv提供的能力来实现addons，但是这就需要你掌握C/C++的知识，同时对v8、libuv、node的内部库已经其他Node使用到的库都比较熟悉，这样才能开发一个Node的addon。可以看到，这种开发方式对人的要求很高，具有一定的入门门槛，这种方式类似于直接写Node的源码了。

```cpp
#include <node.h>

namespace hello {
    
using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::NewStringType;
using v8::Object;
using v8::String;
using v8::Value;

void Say(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  args.GetReturnValue().Set(String::NewFromUtf8(
      isolate, "hello world", NewStringType::kNormal).ToLocalChecked());
}

void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "say", Say);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)

}
```

上面的代码实现一个addons，暂时叫他hello好了，hello addon只有一个方法Say，返回hello world字符串。然后在编写binding.gyp:

```python
{
    "targets": [
        {
            "target_name": "hello",
            "sources": ["hello.cpp"]
        }
    ]
}
```

执行node-gyp指令：

```shell
node-gyp configure 
node-gyp build
```

生成的文件在build目录下，.node文件在build/Release中，然后编写测试文件test.js：

```javascript
const hello = require('./build/Release/hello');

console.log(hello.say());
```

执行文件，打印hello world则表明我门的addons是正确的。

这种方式开发扩展，上手难度大还不是它的主要问题，主要问题是不稳定，举个例子：由于是直接使用的v8、libuv的库进行开发的，当依赖的库的api发生了变化后，编写的扩展就无法正常使用，这个问题才是致命的。看下面的例子：

```cpp
  // node version: 8.9.0
  V8_DEPRECATED("Use maybe version",
                Local<Object> NewInstance(int argc, Local<Value> argv[]) const);
  V8_WARN_UNUSED_RESULT MaybeLocal<Object> NewInstance(
      Local<Context> context, int argc, Local<Value> argv[]) const;

  V8_DEPRECATED("Use maybe version", Local<Object> NewInstance() const);
  
  V8_WARN_UNUSED_RESULT MaybeLocal<Object> NewInstance(
      Local<Context> context) const {
    return NewInstance(context, 0, nullptr);
  }
```

上面是8.9.0版本的node的v8.h文件中的NewInstance方法的声明，但是有两个已经被标记为V8_DEPRECATED，官方在Node>v10.x的版本中移除了之前被标记为V8_DEPRECATED的NewInstance方法，所以之前使用了这两个方法的addons在>v10.x的版本中都不能正确编译。

## 使用NAN实现addons

由于直接使用C/C++的库开发addons存在问题，所以就有人在这基础之上进行封装，屏蔽掉底层变化带来的影响，让开发的addons尽可能的稳定。所以提供了nan.h的头文件定义，开发者只需要在开发的时候引入nan.h，使用其中提供的API进行addons的开发，nan的全称是Native Abstractions for Node.js。我们使用NAN改写上面的hello扩展。

```cpp
#include <nan.h>

void Say(const Nan::FunctionCallbackInfo<v8::Value>& info) {
    info.GetReturnValue().Set(Nan::New("hello world").ToLocalChecked());
}

void Init(v8::Local<v8::Object> exports) {
    v8::Local<v8::Context> context = exports->CreationContext();
    exports->Set(context, 
                Nan::New("Say").ToLocalChecked(),
                Nan::New<v8::FunctionTemplate>(Say)->GetFunction(context).ToLocalChecked());
}

NODE_MODULE(hello, Init)
```

NAN方式的binding.gyp文件有所不同，因为这里需要引入nan.h的第三方的库，nan具体的使用方式参考[nan官方文档](https://github.com/nodejs/nan)，修改后如下：

```python
{
    "targets": [
        {
            "target_name": "hello",
            "sources": ["hello.cpp"],
            "include_dirs": ["<!(node -e \"require('nan')\")"]
        }
    ]
}
```

可以看到使用nan的方式开发addons还是有不小的问题，我们也需要去了解v8、libuv等在开发中使用到的库，开发的难度还是不小，好处就是nan对底层的API做了处理，使用宏定义的方式让我们编写的addons能在不同的Node版本中编译运行，对nan具体的实现方式感兴趣的可以直接参考官方文档和源码。

使用nan方式开发的addons可以兼容不同的Node版本，我们无须关注底层API的变动情况。想在不同的Node版本中运行不需要修改源文件的代码，只需要重新编译源文件即可，即nan实现了一次编写，到处编译。

## 使用N-API实现addons

对比了上面的两种方式，我们发现，编写Node addons还是需要关注底层的API，那有没有完全不用关注底层API的方式呢？这时候就到了N-API登场了，N-API在8.x版本中已实验特性出现在官方文档中，开发可以使用该特性进行addons的开发。当然，目前这已经是官方主推的Node addons开发方式了。

**N-API (pronounced N as in the letter, followed by API) is an API for building native Addons. It is independent from the underlying JavaScript runtime (for example, V8) and is maintained as part of Node.js itself. This API will be Application Binary Interface (ABI) stable across versions of Node.js. It is intended to insulate Addons from changes in the underlying JavaScript engine and allow modules compiled for one major version to run on later major versions of Node.js without recompilation. The [ABI Stability](https://nodejs.org/en/docs/guides/abi-stability/) guide provides a more in-depth explanation. ** 这是官方文档的原话，大致的意思就是说N-API提供了一种独立于JS底层运行时（如：v8）的addons开发方式，在不同的版本中都能保证稳定性，并且N-API作为Node.js的一部分内容而被官方进行维护。N-API的主要目标是：

- 提供稳定的ABI接口
- 消除Node版本差异
- 消除JS引擎差异

也就是说，我们使用了N-API，就不需要过多的关注不同版本之间底层的变动，不再需要重复的编译就可以在不同的版本上运行我们编写好的addons了。如果你体会过由于Node的版本升级，你需要修改你的扩展包才能运行，由于不同的版本，你需要引入不同版本编译的文件，那你就无法体会之前两种开发方式的痛苦，对于维护Node addons的开发者来说，N-API简直就是福音啊。

N-API提供的API主要是用来创建和操作JS的值，这样我们就不需要在直接使用v8提供的数据类型，简化了代码。

使用N-API开发，我们就只需要关注N-API提供的能力。下面我们就使用N-API改写hello：

```cpp
#define NAPI_CERSION 3
#include <node_api.h>

napi_value Say(napi_env env, napi_callback_info info) {
    napi_value res;
    napi_create_string_utf8(env, "hello world", 12, &res);
    return res;
}

napi_value Init(napi_env env, napi_value exports) {
    napi_status status;
    napi_property_descriptor desc = { "Say", 0, Say, 0, 0, 0, napi_default, 0 };
    status = napi_define_properties(env, exports, 1, &desc);
    return 0;
}

NAPI_MODULE(hello, Init)
```

使用N-API的方式进行开发，我们只需要关注N-API的使用，不用关注JS底层的逻辑和数据类型，降低了编写addons的难度，同时提供了跨版本运行的支持，不用再为跨版本运行的事情苦恼了。

## 总结

从native到nan，再到N-API，我们看到了Node addons编写的技术演变路径。初期的时候，Node处于快速迭代的时期，包括底层的变动都是比较多的，导致开发的addons稳定性成为最大的问题，addons无法在不同的Node版本上运行，需要修改源码、重新编译后才能在新版本上正常使用。为了解决这个问题，提出了nan(Native Abstractions for Node.js)的解决方法，nan对底层的方法进行了抽象，保证了开发的addons相对稳定，与之前开发的addons相比，稳定性有了进一步的提升（在major版本之间运行是不会有问题，毕竟major版本更新相关还是比较慢的）。

但是nan并没有彻底的解决addons跨版本运行的问题，所以有了现在主流的N-API。使用N-API也需要你掌握C/C++相关的知识，但是应简单很多了，最关键的是，开发的addons很稳定，可以跨版本运行，省去了很多维护的成本。

如果你还在维护不同版本的addons，那么，N-API是你最好的选择。

### 参考文档

1. http://localhost:8080/en/docs/guides/abi-stability/
2. https://nodejs.org/docs/latest-v12.x/api/n-api.html
3. https://cnodejs.org/topic/5957626dacfce9295ba072e0