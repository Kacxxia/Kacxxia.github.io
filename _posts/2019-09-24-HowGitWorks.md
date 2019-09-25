---
layout: post
title: Git内部工作原理
subtitle: 学习Git如何进行存储、分支和压缩
description: "Author: Kacxxia; Abstract: How Git Works"
keywords: "Kacxxia, Web, Git, SVN, Git vs SVN, 原理, How it works, Git garbage collection, gc, add, commit, branch, tag, HEAD, git internals, porcelain, plumbing"
tags:
  - Git
  - 原理
---

在日常使用Git进行版本的快速切换时，不免会产生疑问：Git到底是怎么样存储和快速载入这些文件的？分支到底是什么？Git如何优化占用空间？ 

接下来的章节将介绍：
1.  `git add`, `git commit`的内部
2.  `git branch`, `tag`, `HEAD`的内部
3.  `git gc`
4.  关于SVN的一点小澄清

### 前言
我们平常所接触到的诸如`add`、`commit`这类命令，其实是由更加底层的git命令所组成。这样高层次的、对用户友好的命令称作"porcelain"命令，功能强大的底层命令则称作"plumbing"命令。  
在进行`git init`之时，git就已经创建了一个.git目录，各种git命令实际上就是对里面的目录文件进行读写。  
![ls-git](/assets/img/Git/ls-git.png){: .my-1 .width80p.center title=".git目录结构"}
<span>.git目录结构</span>{: .center .img-caption}  
图中的objects/存储着历史文件，refs/存储着分支相关的信息等等。

### 文件历史
当我们进行`git add`时，git会采用SHA-1将所要add的文件的*内容*分别映射成40位的哈希值，然后将哈希的前2位当作目录，后38位作为文件名存储经过zlib压缩过后的内容到.git/objects/下。这类文件的类型称作blob，这类文件也叫做blob object。 
![.git-directory-after-git-add](/assets/img/Git/add-README.png){: .my-1 .width80p.center title="git add文件后的.git/objects"}
<span>`git add`文件后的.git/objects</span>{: .center .img-caption}  
> **NOTE** 这也就意味着，如果修改了文件A，那么`git add A`会创建一份记录A的新内容的文件A'。如果紧接着继续修改A然后再一次`git add A`，会创建一份记录最新内容的文件A''，且A'仍然存在。(不过git的garbage collection机制会删除A'。

通常会说`git add`是将指定的文件存到了暂存区，这个暂存区也叫做index，是从working tree到repository间的过渡版本，由旧index和被add的文件组成。旧index就是未进行任何文件改动时的目录文件版本，即HEAD所在的commit的版本。`git add`对应的"plumbing"命令为`git update-index`。从名称也能看出git add的作用为更新index。  

在进行`git commit`时，git首先会根据index生成目录结构树，从根目录开始：同一目录层级中，遇到文件，对内容进行哈希计算，并与文件名进行关联；遇到子目录则开始递归；最后将文件名-哈希s、子目录所对应的trees进行哈希计算，生成一个文件同样保存在.git/objects/{哈希前2位}}/{哈希后38位}，这类文件的类型称作tree，这类文件也叫做tree object。可以看到在操作末，每一个tree文件都对应一个目录层级，记录着当前目录的文件信息以及子目录的信息。这一根据index生成tree的操作对应`git write-tree`。  

现在，如果我们能够记录一个树的根节点的信息，那相当于记录了一个版本中所有文件。这就是`git commit`的下一步操作`git commit-tree`。`git commit-tree`会以传入的参数tree作为指向的树的根节点创建一个commit object。同样的，它也是保存在.git/objects下的一个文件，文件名为内容的哈希值，文件内容则包含author、commiter、message、parent以及对应的tree的哈希，类型则为commit，也叫做commit object。  
![.git-directory-after-git-commit](/assets/img/Git/commit-README.png){: .my-1 .width80p.center title="git commit文件后.git/objects下新增的文件"}
<span>`git commit`后.git/objects下新增的文件</span>{: .center .img-caption}  

我们可以用`git cat-file -p`来显示.git/objects下的文件的内容，用`git cat-file -p`显示文件的类型(blob, tree, commit)。  
![show-commit](/assets/img/Git/show-commit.png){: .my-1 .width80p.center title="commit object的实际内容"}
<span>commit object的实际内容</span>{: .center .img-caption}  

![show-tree](/assets/img/Git/show-tree.png){: .my-1 .width80p.center title="tree object的实际内容"}
<span>tree object的实际内容</span>{: .center .img-caption}  

![show-blob](/assets/img/Git/show-blob.png){: .my-1 .width80p.center title="blob object的实际内容"}
<span>blob object的实际内容</span>{: .center .img-caption}  

--- 
文件没有扩展名，git是如何进行blog/tree/commit文件类型区分的？  
它们的内容实际上只由一个头部和原内容组成，头部的格式为`{type} {content.length}\0`。git命令在创建文件时就已经写入了它的类型和要储存的信息。  

而git作为目录名和文件名的哈希值又只通过文件内容计算得出。那意思是，即使是在不同目录下，甚至文件名都不一样，只要文件内容一致，那实际存储就只有一份文件？实际试验下确实如此。  
![same-content-with-diff-path](/assets/img/Git/same-content-with-diff-path.png){: .my-1 .width80p.center title="不同路径的内容相同的文件只有一份"}
<span>不同路径的内容相同的文件只有一份</span>{: .center .img-caption}  

不同路径、不同文件名、相同内容，让人不禁想到了文件的移动与重命名。  
#### `git mv` 与 `mv`
我们知道`git mv`和`mv`是有一些不同的。如果对比`git mv`后的`git status`和`mv`后的`git status`，呈现的结果不同：
![mv-vs-gitmv](/assets/img/Git/mv-vs-gitmv.png){: .my-1 .width80p.center title="mv vs git mv"}  
<span>`git mv`和`mv`的`git status`不太一样</span>{: .center .img-caption}
其实`git status`也写的很明白，`git mv`的文件已经只等着commit了，而`mv`的文件还是not staged的状态，也就是说`git mv`会自动进行`git add`，也就是更新index。  
**现在如果进行commit会怎么样**  
结合前面的知识，文件的内容并没有发生改变，只有两个文件的文件名发生改变，而tree存储着文件与文件名的关系，所以应该会有两个新的tree生成，加上commit本身一个，总共会新增三个文件。  
![commit-rename](/assets/img/Git/commit-rename.png){: .my-1 .width80p.center title="commit重命名改动后.git/objects的变动"}
<span>commit重命名改动后.git/objects的变动</span>{: .center .img-caption}  

### 分支、tag与HEAD
现在我们知道commit的名字是一串哈希，想快速切换版本还得记哈希，非常不方便。分支和tag类似于commit的别名，但细节上有差异：
* 分支：当进行`git commit`时，分支会指向新的commit
* tag: lightweight tag相当于commit的别名，指向commit。annonate tag在此基础上还具有message、tagger等信息。

分支和tag分别存储在refs/heads/和refs/tags/下。相比于objects/中二进制的文件，它们都是文本内容，为对应的commit的hash。annonate tag，在创建时会在/objects新增type为commit的文件，用于记录对应的commit和额外的信息，它refs/tags/中文件的内容也是这个commit本身的哈希。  

`git branch`会在当前的commit上新增分支，那么如何知道'当前commit'呢？它就存储在HEAD文件中，不过HEAD文件所存储信息大部分情况下是分支，这样的好处是当进行新的commit、分支移动时，HEAD还是会在分支的顶端，指向新的commit。  
如果`git checkout`到某一具体的commit(通过哈希值或是tag)的话，HEAD中的内容就会变成一串哈希——指向commit。并且此时git会提示进入了detached HEAD状态。git的garbage collection会自动清除没有被分支或是tag引用的commit，这意味着如果此时进行了新的commit，在没创建新分支引用它的情况下将HEAD切到了其他的分支，这些新的commit最终会被gc清除。  

### garbage collection
`git gc`的主要工作就是清理无用的文件与对repository进行优化。  
例如前文所提到的，如果`git add`两次不同文件内容，那/objects也会出现两个文件版本，但实际上只有第二个才是需要的。`git gc`(`git prune`)会删除这些无用的文件。  
例如有一个超大文件，而对其的改动只是在末尾添了一行注释。按照之前的步骤，这样会生成第二个超大文件。`git gc`(`git repack`)会将原来的/objects下的文件(loose object)通过delta compression压缩打包成一个文件，并且附上一个.idx文件用于标识各object的位置。  
![git-gc](/assets/img/Git/git-gc.png){: .my-1 .width80p.center title="git gc"}
<span>`git gc`</span>{: .center .img-caption}  
是不是觉得很熟悉？git会在push的时候自动进行gc。  

### 关于SVN的一点小澄清
在读《Pro Git》的时候，其实感觉作者在强烈暗示Git多么轻便易用，SVN等其他VCS多不好用。比如它说其他VCS切换分支开销很大，需要复制很多文件什么的。但其实svn book的分支章节提到了"Cheap Copy"这个概念，如果在repository进行分支切换，会对当前版本的所有文件进行hard link，尽可能的引用原文件减小体积，分支切换也十分迅速。实际上wordpress项目的SVN版和Git版的体积也相差不大。  
另外，git作为分布式存储库，意味着每个成员都有对库的全部进行读写的权限，而SVN作为中央控制，可以按路径控制成员的访问权限。但git作为分布式存储库容灾能力也比较好，只能说是得根据项目需求选择相应的技术。

### 参考与引申
《Pro Git》  
《Version Control With Subversion For Subversion 1.7》(svn book)  
[Subversion vs. Git: Myths and Facts](https://svnvsgit.com/) 

