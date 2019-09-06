---
layout: post
title: Event Loop
subtitle: Node.js的异步机制
description: "Author: Kacxxia; Abstract: Node.js异步"
keywords: "Kacxxia, Web, Event Loop, 事件循环, Node.js, 异步, async, 原理,  How it works,"
tags:
  - Event Loop
  - Node.js
---

*做在控制台输出文件处理进度的时候，想了解Node背后的异步机制*

---

参考文献  
[Event Loop - Medium]([asdd](https://jsblog.insiderattack.net/event-loop-and-the-big-picture-nodejs-event-loop-part-1-1cb67a182810))  
[Event Loop - Nodejs.org](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

---

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
