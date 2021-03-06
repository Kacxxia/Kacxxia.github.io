---
layout: post
title: 走近TrueType
subtitle: 探究TrueType的内部及相关
description: "Author: Kacxxia; Abstract: How TTF Works"
keywords: "Kacxxia, Web, TTF, TrueType, 字体, Font, 原理, How it works, ttc, Truetype Collection, cmap, format 4"
tags:
  - 字体
  - TrueType
---
## 背景
浏览器是怎么渲染文字的？我们知道屏幕由很多像素点组成，要能显示东西，得点亮相应的像素点。为了能够显示文字，我们得需要知道一个字对应哪些像素点，也就需要先读取其相应的字体文件，因为它存储了字体的所有相关信息。按照所存的信息的种类和数量可以把字体文件分为三种：Bitmap, Vector, Stroke。  

Bitmap正如其名那样，把字直接映射为Bitmap，直接存储一个字对应哪些像素点，电脑只需要在恰当的位置点亮相应的像素点即可，因此处理的速度最快。但是因为屏幕的分辨率多种多样，如果要能正确清晰地显示文字，需要为每种分辨率都准备一份Bitmap字体文件。  
Vector也叫Outline，通过Bézier曲线来描述字形，再加上适当的技巧来判断字形的“内外”，即可确定哪些像素点需要点亮。为了能够在低分辨率的屏幕上也能正确显示文字，还会通过hinting来进行优化。如今基本上Web的所有字体文件，.ttf/.otf/.eot/.woff等都是Outline字体。  
Stroke是先通过几个点来确定字形的基本骨架，类似于用2px的画笔先画出一个字，然后通过对改变点与点之间的线的描述来改变笔画粗细、有无衬线等。相比于Outline，Stroke用的点的数量更少。  

浏览器在加载好字体文件后，之后的解析文件信息的工作则是交给字体引擎（Font Engine），如Direct2D、DirectWrite、Freetype，最后渲染文字的工作则是交给渲染引擎完成，如Skia、Direct2D。  

在之后的章节，我们将走进TTF(TrueType Font)的内部，初步了解一个字体文件里面包含了哪些信息、字体引擎的工作流程是什么。  

#### .otf/.ttf/.pfb/.woff/与一点历史
上个世纪八十年代，Adobe从已有的Postscript出发，开发出了Outline类型的字体PostScript Type 1。它是Postscript的一个子集，通过已有的绘图指令来绘出文字，并加入了hinting使得文字即使是在低分辨率的屏幕上也能取得不错的显示效果。  
但PS的字体(Type1/Type2/Type3)闭源而且贵，于是在就是九十年代初Apple开发出了另一Outline类型的字体——True Type，并且免费授权给Microsoft使用。Microsoft在把TrueType应用到Windows操作系统的同时，也开发出了当时多个Postscript流行字体的TrueType版，这些字体现在也还是能够经常在CSS里看到：Times New Roman(PS的Times Roman)、Arial(PS的Helvetica)、Courier New(PS的Courier)。  
后来Microsoft想用苹果的高级的字体渲染技术GX Typography，但交涉失败。这促进了Microsoft基于TrueType自己研究相关的高级技术，即TrueType Open，后来Adobe也加入了这项研究，并带去了Type 1。扩展两种Outline字体之上，TrueType Open后来改名为OpenType。  
作为对TrueType的回应，Adobe加大了在字体抗锯齿等方面的投入，Microsoft和Apple也不甘示弱。正是这些公司的激烈竞争，促进了Desktop Publishing等领域的迅速发展。  
在2008年左右开始Web开始迅速发展，为了区分桌面和Web的字体、也为了字体能够更快的加载，2009年WOFF(Web Open Font Format)的第一稿提出。WOFF主要是对TrueType和OpenType进行压缩。采用更高效的压缩算法的WOFF2规范也于2018年出版。  


## TrueType

### 总体结构
一个.ttf文件就像是某种网络协议的包，遵守着一种网络协议一串字节。  
这里的“协议”就是sfnt，sfnt是Apple自定的一种字体表结构，包括一个表头和各种各样的表。其中表头定义了表的目录结构以用于表的查找定位：总共有多少种表、每种表在"第几页"等等。表有'cmap', 'glyf'等多种类型，记录着字体的信息。  
注意TrueType字体文件.ttf其实是sfnt格式加上一些TrueType特有的技术。其他种类的字体文件也可以遵守sfnt格式并添加额外的表的种类来采取他们特有的技术，例如OpenType。  
为了TrueType能够正常运作，ttf的各种表，有一些是必须具备的，有一些则是可选的。必须具备的表包括'cmap', 'glyf', 'head', 'hhea', 'hmtx', 'loca', 'maxp', 'name', 'post'。  
* name。记录人类易读的信息，例如字体名、样式名。
* head。记录字体的总体信息，例如版本、书写方向、创建和修改日期等。
* cmap。记录字符编码与字形索引的映射方式。因为不同操作系统的默认编码可能不同，因此cmap可能包括多个子表，为每个要支持的编码方案记录映射。
* loca。映射字形索引和字形在glyf表中的实际位置
* glyf。记录字形信息以及对字形进行细化的一系列指令。
* hhea。对水平排版的字体的总体layout。
* hmtx。对水平排版的字形的layout。
* maxp。记录字体所需的内存信息，如字形数量、组合字形数量。
* post。记录TrueType在PostScript打印机上正常运作所需的信息。  

#### eg. cmap及其格式
cmap存储的是将字符编码映射到字形索引的方法，这样定义严格来说也不正确，其实cmap有很多种格式。  
Truetype刚出来的那个时代ASCII是主流，基本上都在用format 0，在cmap里直接存储一个256长的数组，记录某个字符编码具体对应什么字形索引。  
但在现在，不仅要考虑兼容各种字符集，还要尽可能减小文件的体积，所以相比于存储“结果”，存储“方法”更加符合普遍需求。  
cmap从古到今共有format 0, format 2, format 4, format 6, format 8.0, format 10.0, format 12.0, format 13.0, format 14.0。这些format的一种或多种已经弃用很久了，当代使用最为广泛的是format 4, 6和12。  
format 4记录着将分散的双字节编码字符映射到字形索引所需要的信息。分散是指，虽然字体文件里的字形的索引是连续的，但字符却不一定，比如Unicode中的拉丁字母和CJK字符完全坐落在不同的区域。format 4本身相当于将几段不连续的区域映射到一段连续的区域。  
相比于format 4, format 6映射连续紧凑的双字节编码字符，format 12则在分段的记录表示上有些区别。  

### Font Engine
将TrueType字体中的信息转变成栅格化的图像需要三步：Scale, Grid-fit, Rasterlize。

#### Scale
在创建TrueType的字体时，通常不需要考虑太多实际显示设备的分辨率，因为软件中的字体长度的单位通常都是与实际输出设备的分辨率无关的。作者只需要考虑一格(em square)中的字长什么样。创作软件中的最小长度单位叫做Font Unit，每格中的Font Unit越多，最后的实际效果也越与画的一致，类似于分辨率。  
Scale的工作是将与在与输出设备无关环境下作成的字形master outline转换成实际所需的尺寸，也就是实际所需的像素。我们已经知道字形的轮廓由多个点通过Bézier曲线定义，所以这个转化过程也相当于把原坐标系转化成一个以像素为单位的点的坐标系。这个新的坐标系的最小单位是1/64像素，实际像素的中心在每个32/64处。  

Scale的另一项工作就是在原有的轮廓下多加上两个点，起始点(origin point)和步进点(advance point)。类似于起笔准备开始画字的位置，落笔准备开始画下一个字的位置。它们之间的长度就是步进宽(advance width)。

#### Grid-fit
虽然我们已经有了字形轮廓，但不能直接把它们转化成栅格化图像，因为有个很重要的问题：拿简单例子来说，一个矩形的轮廓落在两列像素的中间，应该是点亮左列、右列、还是两列都点亮？  
这个疑问可能会造成位置不同的同一个圆形轮廓点亮的像素不一致、H字符的两条竖杠不同宽、衬线显示异常等多种实际问题。  
![before GridFit](/assets/img/TrueType/BeforeGridFit.png){:  .center style="width: 200px;" title="before GridFit"}  
<span>未进行grid-fit前的潜在问题</span>{: .center.img-caption}
为了解决这些，我们需要在尽可能保留字体的本身特性的条件下根据输出设备的分辨率微调字形轮廓的位置。在了解诸如Cap height, x-height, 杠宽, 衬线, 步进宽等关键特性的基础上，参考原有的字形轮廓依据一系列指令重新一步步绘制点至新的轮廓，这一系列操作也叫做hinting。

#### Rasterize
现在我们已经有了合适的字形轮廓，剩下的工作就是由scanner进行扫描、选择要点亮轮廓内的像素加入bitmap了。但要如何定义这个“轮廓内”？TrueType采用了non-zero winding rule。  
轮廓实际上就是一系列的点，这些点的绘制顺序定义了轮廓的方向，在扫描到某一点时，点出发向远处引射线，如果轮廓方向从是scanner的扫描方向（由右到左、从下到上）则count++，否则count--，最终count不为零则点在轮廓内。  

### 高级样式
如果文件里面只包含了必须的表，或者另只包含了与layout无关的表，那这就是一个简单字体，只包含最基础的形状。复杂的字体则包含笔画的连接、装饰记号、复杂的连字等等。

![Complex Font](/assets/img/TrueType/Zapfino.png){: .center.my-1 style="width: 200px;" title="Complex Font"}  
<span>高级字体</span>{: .center.img-caption}

### TrueType Collection
通常一个Font family下会包含各种style的font，像是Regular, Light, Normal，它们的大部分表其实都是一致的，每个style都存储单独的字体文件未免太浪费空间。.ttc(TrueType collection/OpenType collection)文件就是同一个family下不同font的集合，它最大的好处就是多个字体可以共用一张表。在生成ttc时，会根据表的checksum、长度、实际数据进行判断，如果一致则表示表相同，最后生成一个结构类似`{ttc版本} {字体文件数量} {各字体的目录结构} {表}`的文件。  

![collection vs single file](/assets/img/TrueType/ttc.png){: .center style="width: 400px;" title="font collection vs single file"}  
<span>ttc文件与其包含的各字体文件对比</span>{: .center.img-caption}

### 参考与引申
[TrueType Reference Manual](https://developer.apple.com/fonts/TrueType-Reference-Manual/)  
[OpenType - Wikipedia](https://www.wikiwand.com/en/OpenType)  
[TrueType - Wikipedia](https://www.wikiwand.com/en/TrueType)  
[PostScript Fonts - Wikipedia](https://www.wikiwand.com/en/PostScript_fonts)  
[A Closer Look At Font Rendering](https://www.smashingmagazine.com/2012/04/a-closer-look-at-font-rendering/)  
[Type rendering on the web](https://blog.typekit.com/2010/10/05/type-rendering-on-the-web/)  
[otf2otc.py](https://github.com/adobe-type-tools/afdko/blob/develop/python/afdko/otf2otc.py)