---
layout: post
title: E站表里站机制与Cookie
subtitle: RFC6265 Cookie及相关回顾
description: "Author: Kacxxia; Abstract: Cookies"
keywords: "Kacxxia, Web, Cookie, 隐私, Privacy, RFC 6265, 原理, How it works, 网站分析, website analysis, E站"
tags:
  - Cookie
  - HTTP
  - 网站分析
  - RFC
---
## E站的登录状态统一
前一阵子E站面临关站，才知道它还有个里站，而且需要通过特殊的方式进行访问。

如果是直接访问里站的话，界面只会显示一张Sadpanda图片。只有在登过表站账号的情况下才能够正常访问里站。

看上去是利用了账号登录的cookie，但域名不同的表里两站是如何做到cookie共享的？其步骤大致如下。
1.  访问里站。[没有yay Cookie ? ->3]
2.  Sadpanda。*stop*
3.  [有账号 Cookie ? ->7]
4.  302重定向至表站一个api，Location带上一串拼接哈希（固定头+随机生成，大概用作标识）。
5.  302重定向回里站，Location带上base64（大概是用户id）。
6.  为里站设置相关账号Cookie，302重定向至里站首页。->1
7.  正常里站页面。*stop*

由上可以看到E站主要是通过结合302重定向和自动带Cookie来实现表里登录状态统一的。我们知道Cookie不简简单单就是键值对信息，它还有诸如Domain, Path这样的额外属性。这些属性的语法如何，是怎样进行处理的？让我们重新回顾Cookie的规范——RFC 6265-HTTP State Management Mechanism.


## Cookie回顾
先来考虑一下几个问题问题(答案见文末)：
1.  server端如何移除客户端的Cookie？
2.  通过非HTTP方式（如JS）设置一个httpOnly的cookie会怎么样？
3.  Set-Cookie中如果同时设置了Expire和Max-Age会怎么样？如果都没有设置呢？
4.  访问example.com时：
      * 不设置Domain，访问foo.example.com会怎么样？
      * Domain属性设为example.com，访问foo.example.com会怎么样？设为*.example.com有区别吗，.example呢
      * Domain属性设为test.com会怎么样
      * Domain属性设为.com，访问baidu.com会怎么样？
5.  访问中文域名如"国务院.政务"时，Domain属性能像英文那样设为"国务院.政务"吗？
6.  Path属性设为/user能匹配哪些路径？Path不写会怎么样？


## 具体实现
规范建议浏览器实现：
* 每个域名至少能有50个cookie
* 每个cookie至少能有4096字节大
* 总共至少能有3000个cookie

> [但浏览器的实际实现却有很大不同](http://browsercookielimits.squawky.net/) 
> 每个cookie最大只能有4096字节左右，最大cookie数也从30一直往上不等，有些浏览器还提出了`Max Size Per Domain`，对每个域名下的cookie总大小进行了限制。
> 因此为了能够兼容大部分的浏览器，最好把域名下的cookie总数限制在30左右，总大小限制在4096字节左右，每个cookie不要超过4096字节。


## Cookie与隐私
UA自动携带Cookie的HTTP特性在带来诸多便利的同时也存在着隐私泄露的可能性。  
第三方Cookie：例如网站A和网站B都嵌入了广告主C的内容，即使没有直接访问C，在加载网站A和网站B的时候，解析到相应内容、向C发送请求并携带Cookie、或是发送请求被C设置Cookie，都有可能被C记录行为的可能。
Web Bug(Web Beacon)：网站在页面的不同内容区域分别放一个1px大小的图片作为“信标”，用户在访问到对应区域时，请求图片的同时也带上Cookie，也被记录了用户行为。

以上两种行为均可归类于Tracking，即记录用户信息。除了用Cookie进行记录，网站也在用JS脚本记录用户信息，比如引用[Google的analytics.js](https://developers.google.com/analytics/devguides/collection/analyticsjs/)，其操作手册上记录了所支持各式Tracking类型：记录页面访问量的Page Tracking、记录页面加载情况和用户所有交互行为的Event Tracking、记录用户分享到第三方操作的Social Interactions、记录页面哪些部分用户看的最多及用户是如何在其之间进行导航的App Tracking。

## Cookie与安全

#### Ambient Authority
Cookie这种自动带上的特性，再加上第三方可以让浏览器模仿用户行为发送请求，使得第三方可以通过Cookie让服务器进行Authorize，也就是CSRF的应用。

#### 明文
鉴于Cookie本身是完全明文的，所以建议在加密连接如HTTPS上进行Cookie的传输，并且在设置的时候注意Secure属性的设置。不设置Secure的话攻击者可能在中途把请求重定向到HTTP连接，而Cookie仍然会被带上。
另外也可以直接对Cookie进行加密和签名，但这无法避免重放攻击。


## 答案
1.  通过Set-Cookie设置一个新的带有Expired字段的Domain和Path都相同的Cookie。前端想要删除也是同理。
2.  无法设置成功。UA在处理Set-Cookie时有一个完整的流程，即Cookie的存储模型。
3.  同时设置时取Max-Age。都没设置时Cookie保存至会话结束。注意浏览器不一定非要保存Cookie到Max-Age或Expired，因为性能、容量等情况浏览器也可能会先行移除。
4.      
    * 不会带上Cookie。不设置Domain，默认只会带给原服务器。
    * 会带上Cookie。设置Domain，访问其及子域名时会带上。准确来说*.和.开头的都属于不正确的语法，但以.开头能被当作没有处理，不过结尾如果带上.反而会让浏览器忽略Domain属性。
    * 不能被设置。UA会忽略那些Domain不包含原服务器host的Cookie。
    * 不能被设置，大多数UA会拒绝这种“Public suffixes"。
5.  不仅Domain属性本身语法就不允许中文，而且中文域名实际上会被转换(Canonicalize)成英文[NOTE1]
6.  /user能匹配/user和/users/*，另外/user和/user/的效果是一致的。Path的默认值为当前host的path或者是/。


> NOTE1  (RFC 5890)
> 
> IDNA(Internationalizing Domain Names for Applications)主要是用于domain的国际化。其中域名domain的有效label(e.g. https://label1.label2)分为三类： NR-LDH labels, A-labels和U-labels。  
> 
> U-label是至少带一个不在ASCII范围内字符的label，例如带汉字的label。  
> LDH labels（Letter-Digit-Hyphen)，即由字母数字-组成的label，属于ASCII的范畴。它又可分为R-LDH labels(Reserved)和NR-LDH labels(Non-Reserved)。  
> R-LDH labels是指第三位和第四位都是-的label（eg. xx--test)。R-LDH中由PunyCode算法将U-label转换成ASCII范围所生成的xn--开头的label叫做A-labels(e.g. 国务院 -> xn--zfr54hdx6e)
