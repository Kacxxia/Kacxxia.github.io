# 历程：第一个需求：从零开始实现网站主页刷新随机图片
**关键词**: `Event Loop` | `Git Hooks` | `文件I/O线程池效率` | `打包原理` | `浏览器中的模块机制` | `Webpack-dev-server和jekyll协作的开发环境`
## 概览
从网站的第一个需求：”实现主页背景随机图片”出发，经历了
1.  读写图片，探究`文件I/O并行处理和串行处理的效率不同`
2.  在I/O时打印图片处理过程，学习`Event Loop`
3.  在主页JS中引用图片，学习`打包原理`和`浏览器中的模块发展历程`
4.  搭建舒服的开发环境，配置`Webpack-dev-server和jekyll协作的开发环境`
5.  在push之前进行预处理，构造`Git Hooks`
## 需求总览
  1.  实现：在git commit之前，将电脑上另一文件夹中的所有图片，转换成yml形式存储在博客的_data中。在处理时要动态在控制台中显示处理进度。
  2. 用ES实现随机图片而非jekyll静态生成

## 过程
#### 问题一
| 需求点              | 解决途径                             | 衍生问题                                           |
| ------------------- | ------------------------------------ | -------------------------------------------------- |
| a. 在git commit之前 | git pre-commit hooks                 | shell如何处理错误，即出错时不进入commit阶段        |
| b. 输出结果到控制台 | 输出结果到stdout，清除行再打印，循环 | Node.js中的异步流程                                |
| c. 处理文件         | fs                                   | 串行一个个处理文件与异步（同时）处理文件的效率区别 |

**需求a**
* vscode默认不显示.git文件夹。在设置中搜索File:Exclude，排除**/.git
* 定位到/.git/hooks/pre-commit文件
* 用&&进行串行执行命令
* 在&&串的末尾添加exit 0，表示全部完成再成功退出pre-commit阶段
* pre-commit阶段生成了新的文件，所以另需要`git add`  

---

**需求b**
* 结合readline的clearLine和cursorTo来删除当前行。无cursorTo则不会在行首进行下一次打印
* Node.js异步机制: Event Loop

Event Loop  
参考文献[Event Loop - Medium]([asdd](https://jsblog.insiderattack.net/event-loop-and-the-big-picture-nodejs-event-loop-part-1-1cb67a182810))和[Event Loop - Nodejs.org](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

开发者能触发的异步有：
* setTimeout, setInterval
* setImmediate
* promise, generator
* process.nextTick
* 网络I/O，文件I/O

Libuv(C++)封装了网络I/O（Kqueue等）、文件I/O（线程池）等功能，向上（Javascript）提供统一的接口。  
EventLoop属于底层(Libuv), nextTick和promise则属于上层(Javascript)  
EventLoop包含了
1.  Timer. -- setTimeout和setInterval.
2.  Pending callback. -- 有些I/O的回调需要推迟进行，比如TCP的ECONNREFUSE。
3.  Idle, prepare -- 内部使用
4.  Pool -- 底层I/O，除了close事件
5.  Check -- setImmediate
6.  Close callback. -- close事件

EventLoop从最顶层的Timer阶段开始，每个阶段的工作全完成之后才往下走，但是每完成一步操作都会执行nextTick微队列，promise(原生)微队列则在nextTick之后执行，再切回底层。到Pool阶段时，如果没有I/O事件且Timer有新内容，则会切回Timer阶段。如果有I/O事件，则执行完相应的回调之后，如果Check阶段有内容，则会进入Check阶段。

这里有个值得注意的地方就是去重deduplication机制。Timer阶段和Check阶段不会因为多个异步在JS和C++反复切换。
参考下面的代码
```
const foo = [1, 2];
const bar = ['a', 'b'];

foo.forEach(num => {
  setImmediate(() => {
    console.log('setImmediate', num);
    bar.forEach(char => {
      process.nextTick(() => {
        console.log('process.nextTick', char);
      });
    });
  });
});
```
结果为
```
setImmediate 1
setImmediate 2
process.nextTick a
process.nextTick b
process.nextTick a
process.nextTick b
```
在JS第一次往nextTick队列中添加两个任务后，不会立刻切换回C++执行nextTick队列中的任务。而是继续执行下一个setImmediate的回调继续往nextTick队列中添加两个任务。

---

**需求c**
* `fs.existSync` | `fs.unlink` | `fs.readdir` | `fs.unlink` | `fs.statSync` | `fs.copyFile`
* `stat`文件状态, `lstat`：若是快捷方式，则返回快捷方式本身的状态, `fstat`同`stat`，但要提供文件描述符。
* 将图片数据转换成base64直接用读取完文件后的`data.toString("base64")`
* `dataURL`的格式为data:[\<mediatype>][;base64],\<data>
* 文件I/O的串行处理和并行处理效率问题。参考[这篇Gist](https://gist.github.com/Kacxxia/a1ca0f5f5bea4a35531e0d9eae1a42b4)。读写17个1GB文件，在宏观上确实是一个是同时处理多个文件，一个是按次序单个文件处理。但所花费的总时间确是差不多。可能还是和硬盘的吞吐量？有关。  




#### 问题二
考虑到静态网站的生成，若采用原来的利用_data中的图片，只能在生成网站的时候才会进行随机，不能达到每次访问都随机的目的。
| 需求点 | 解决途径 | 问题 |
|-------|---------|-------|
| a. 能用ES写 | Babel | 无 | 
| b. 在JS中引用图片manifest | webpack | 模块机制，打包的原理 |
| c. 所有网页统一标题，可随时修改，可覆盖 | jekyll配置 | 无 |
| d. 搭建开发环境 | webpack的配置，npm scripts, git hook | ...

**需求b**

##### 浏览器端的模块机制

[JS模块七日谈](https://huangxuan.me/js-module-7day/#/1)

最早期：  
*封装*
* 全局变量。污染变量名
* 命名空间。是对象，可访问私有属性
* 闭包。
* 闭包+可注入依赖。

*加载*
* script标签直接引用。依赖关系模糊，难维护，请求多。某些浏览器中脚本可能不是并行加载，阻塞了其他资源
* LABjs。保证脚本是并行加载，并尽快执行，有需要可以按照依赖关系提供串行执行。

早期，模块化架构：
* YUI3。采用沙箱模式实现模块的定义和使用。

中期：
* CommonJS，MODULES/1.0。服务器端的模块机制。后续发展成了三个分支。1. 继续发展，在浏览器端则进行转换。2. 坚持浏览器的特性。3. 尊重浏览器的特性并尽量遵从1.0规范
* 1.MODULES/Transport规范，如今的Babel实现
* 2.AMD规范，requireJS实现
* 3.MODULES/Wrapping规范，FlyScript实现。CMD规范，SeaJS实现。

后期：
* 分支一迅速发展。出现Browserify对代码进行转换和对JS依赖进行打包。
* 继续出现Webpack。可以打包非JS资源，并用对应的loader进行处理。支持代码分割(chunk)进行按需加载。提供Plugin增加功能。也提供了像dev-server这样的开发工具。

未来：
* 浏览器普遍实现import/export语法进行模块加载。

##### 打包基本过程
[Webpack作者Tobias Koppers现场手工打包](https://www.youtube.com/watch?v=UNMkLHzofQI)  
1.  按照入口文件的模块依赖，生成模块依赖图。包括模块自身的类型（ES，CommonJS)，模块依赖，模块依赖加载方式（同步/异步）
2.  根据模块依赖图，对模块进行分组生成chunk图，至少有main chunk和async chunk group（如果有异步加载）。async group包含多个async chunk。
3.  优化chunk图。因为main是async group的parent。所以async group可以继续使用main中已经加载好的模块。
4.  连接module。连接根和子两个依赖必须满足要求：  1. 根为ES Module。2. 子也为ESM；不是异步import引用；在同一个chunk;子的所有引用者也要在同一个chunk；
5.  给新的模块图中的所有模块赋予ID。给chunk赋予ID
6.  生成代码。1. commonjs. 在全局/运行时添加一个magic_function, 用途是根据模块ID加载模块；把所有ESM原本的import/export替换成magic_function，参数是所需模块的ID，然后在文件外层包裹一层函数，传入magic_function用于引用和module用于暴露自身（保存在全局/运行时）。对于被连接的模块，它们与连接的模块算处于同一个模块中，因此没有自己的模块ID，引用它时直接拼接文件。2. 异步加载。将异步加载语法转换为magic_function.loadChunk函数。loadChunk函数添加script tag，根据传入的chunkID引用对应的异步chunk。异步chunk则是结合jsonp在全局/运行时添加自身模块。

*实际问题的不妥之处*  

原本的manifest.json，保存了图片的所有信息，包括图片的内容。这样在打包到初始JS中，会导致资源体积过大。因此改为manifest.json存储图片的元数据，JS再动态引用图片。  

---

**需求d**  
原本的开发环境是webpack watch源JS文件，jekyll watch除源JS文件外的所有文件，由jekyll进行serve。
改为jekyll watch除源JS文件外的所有文件，由webpack-dev-server serve jekyll生成的__site以及watch源JS文件，把新编译好的源JS文件直接输出到__site中。
这样的好处是
* jekyll的serve有不能加载CJK文件名的资源的不明原因
* 修改文件有Live Load。  

这样做需要两个webpack配置文件分别用于生产和开发环境。  
而且因为devServer编译好的JS文件不会写到磁盘上，而是存放在内存中，所以在commit之前需要进行webpack和jekyll build。