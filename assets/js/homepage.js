!function(t,i){"object"==typeof exports&&"object"==typeof module?module.exports=i():"function"==typeof define&&define.amd?define([],i):"object"==typeof exports?exports.AutoBtnColor=i():t.AutoBtnColor=i()}(window,function(){return function(t){var i={};function e(n){if(i[n])return i[n].exports;var r=i[n]={i:n,l:!1,exports:{}};return t[n].call(r.exports,r,r.exports,e),r.l=!0,r.exports}return e.m=t,e.c=i,e.d=function(t,i,n){e.o(t,i)||Object.defineProperty(t,i,{enumerable:!0,get:n})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,i){if(1&i&&(t=e(t)),8&i)return t;if(4&i&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(e.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&i&&"string"!=typeof t)for(var r in t)e.d(n,r,function(i){return t[i]}.bind(null,r));return n},e.n=function(t){var i=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(i,"a",i),i},e.o=function(t,i){return Object.prototype.hasOwnProperty.call(t,i)},e.p="",e(e.s=1)}([function(t){t.exports={"glacier-Artstaion-jakubSkop":{name:"glacier",from:"Artstaion",artist:"jakubSkop",ext:".jpg"},"ramenshop-Artstation-kennyVo":{name:"ramenshop",from:"Artstation",artist:"kennyVo",ext:".jpg"},"tianXiang-Artstation-Xizuo":{name:"tianXiang",from:"Artstation",artist:"Xizuo",ext:".jpg"}}},function(t,i,e){t.exports=e(2)},function(t,i,e){"use strict";e.r(i);var n=e(0);function r(t,i){if(!(t instanceof i))throw new TypeError("Cannot call a class as a function")}function s(t,i){for(var e=0;e<i.length;e++){var n=i[e];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function a(t,i,e){return i&&s(t.prototype,i),e&&s(t,e),t}var h=function(){function t(i,e,n){r(this,t);var s=document.createElement("canvas");s.classList.add("hide"),i.appendChild(s),this.img=e,this.imgLoader=n,this.canvas=s,this.ctx=s.getContext("2d"),this.container=i,this.build=this.build.bind(this)}return a(t,[{key:"setCamera",value:function(){this.camera=new m(this),window.addEventListener("deviceorientation",y)}},{key:"reset",value:function(){this.canvas.width=this.width=this.container.offsetWidth,this.canvas.height=this.height=this.container.offsetHeight,this.ctx.clearRect(0,0,this.width,this.height)}},{key:"build",value:function(){var t=this;this.reset(),this.imgLoader.subscribe(function(){t.canvas.classList.remove("hide"),t.setViewport(),t.ctx.drawImage(t.img,t.startX,t.startY,t.vw,t.vh,0,0,t.width,t.height),t.setCamera()})}},{key:"setViewport",value:function(){for(this.vw=this.width,this.vh=this.height;this.vw>this.img.width||this.vh>this.img.height;)this.vw=this.vw/1.001,this.vh=this.vh/1.001;this.img.width<this.img.height?(this.vw-=200,this.vh=this.vw*this.height/this.width):(this.vh-=200,this.vw=this.vh*this.width/this.height),this.startX=(this.img.width-this.vw)/2,this.startY=(this.img.height-this.vh)/2,this.img.height>=this.img.width&&(this.startY-=Math.min(this.startY,.118*this.img.height)),this.img.height<this.img.width&&(this.startY+=Math.min(this.img.height-this.startY-this.vh,.118*this.img.height),this.startX+=Math.min(this.img.width-this.startX-this.vw,.118*this.img.width))}},{key:"paint",value:function(t,i){this.ctx.drawImage(this.img,t,i,this.vw,this.vh,0,0,this.width,this.height)}}]),t}(),o=function(){function t(i){var e=this;r(this,t),this.element=i,this.callbacks=[],this.event=null,this.loaded=!1,this.element.addEventListener("load",function(t){console.log(e.callbacks),e.loaded=!0,e.event=t,e.callbacks.forEach(function(t){return t(e.event)})})}return a(t,[{key:"subscribe",value:function(t){var i=this;this.callbacks.push(t),this.loaded&&this.callbacks.forEach(function(t){return t(i.event)})}}]),t}();function c(t){return Math.tan(t/180*Math.PI)}var u,d,l,m=function(){function t(i){r(this,t),this.painter=i,this.sightDistance=1/96*2.54*20,this.lastBeta=void 0,this.lastGamma=void 0,this.anchorBeta=void 0,this.anchorGamma=void 0,this.restoreTime=null,this.betaCounter=0,this.gammaCounter=0,this.ticking=!1}return a(t,[{key:"rotate",value:function(t,i){var e=this;try{if(this.lastBeta=t,this.lastGamma=i,this.ticking)return;if(void 0===this.anchorBeta){var n=Math.sqrt(Math.max(Math.pow(b.startX,2)+Math.pow(b.startY,2),Math.pow(b.startX,2)+Math.pow(b.img.height-b.startY,2),Math.pow(b.img.width-b.startX,2)+Math.pow(b.startY,2),Math.pow(b.img.width-b.startX,2)+Math.pow(b.img.height-b.startY,2)));return this.lastX=this.painter.startX,this.lastY=this.painter.startY,this.anchorBeta=t,this.anchorGamma=i,this.step=Math.abs(n/c(30-t)),void(this.duration=.4)}var r=this.painter.startX-c(i-this.anchorGamma)*this.step,s=this.painter.startY-c(t-this.anchorBeta)*this.step;r<0&&(r=0),r+this.painter.vw>this.painter.img.width&&(r=this.painter.img.width-this.painter.vw),s<0&&(s=0),s+this.painter.vh>this.painter.img.height&&(s=this.painter.img.height-this.painter.vh),this.lastX=r,this.lastY=s,this.painter.paint(r,s),0===r||r===this.painter.img.width-this.painter.vw?this.gammaCount++:this.gammaCount=0,0===s||s===this.painter.img.height-this.painter.vh?this.betaCount++:this.betaCount=0,(this.gammaCount>=54||this.betaCount>=54)&&(this.ticking=!0,this.gammaCount=0,this.betaCount=0,this.cubicBezier=function(t,i,e,n){var r=1-3*e+3*t-0,s=3*e-6*t+0,a=3*t-0,h=1-3*n+3*i-0,o=3*n-6*i+0,c=3*i-0;function u(t,i,e,n){return 1/(3*i*t*t+2*e*t+n)}function d(t,i,e,n,r){return i*(t*t*t)+e*(t*t)+n*t+r}return function(t){for(var i=t,e=0;e<5;e++)(i-=(d(i,r,s,a,0)-t)*u(i,r,s,a))<0&&(i=0),i>1&&(i=1);return function(t,i,e,n,r){return i*(t*t*t)+e*(t*t)+n*t+r}(i,h,o,c,0)}}(0,0,.58,1),window.requestAnimationFrame(function(t){return e.restore(t)}))}catch(t){}}},{key:"restore",value:function(t){var i=this;try{if(null===this.restoreTime)return this.restoreTime=t,void window.requestAnimationFrame(function(t){return i.restore(t)});var e=this.lastX+(this.painter.startX-this.lastX)*this.cubicBezier((t-this.restoreTime)/1e3/this.duration),n=this.lastY+(this.painter.startY-this.lastY)*this.cubicBezier((t-this.restoreTime)/1e3/this.duration);if(this.painter.paint(e,n),(this.lastX-e)*(e-this.painter.startX)<=0&&(this.lastY-n)*(n-this.painter.startY)<=0||(t-this.restoreTime)/1e3>this.duration)return this.restoreTime=null,this.anchorBeta=this.lastBeta,this.anchorGamma=this.lastGamma,void(this.ticking=!1);window.requestAnimationFrame(function(t){return i.restore(t)})}catch(t){alert(t)}}}]),t}(),g=document.getElementById("home-root"),w=document.getElementById("arcade-hint"),v=(u=Object.keys(n),d=u[Math.floor(Math.random()*u.length)],l=n[d],{url:"assets/img/Paintings/".concat(d).concat(l.ext)}),f=new Image;f.src=v.url;var p=new o(f),b=new h(g,f,p),y=function(t,i){var e,n,r,s,a,h={origin:[],towards:[],backwards:[],history:[]},o={origin:[],towards:[],backwards:[],history:[]},c=[],u=[],d=0;function l(t){return 0===t.length?0:t.reduce(function(t,i){return t+i},0)/t.length}function m(t,i){return 0===t.length?0:Math.sqrt(t.reduce(function(t,e){return t+Math.pow(e-i,2)},0)/t.length)}return function(){var g=(new Date).getTime();n=arguments,r=this;var w=arguments[0].beta,v=arguments[0].gamma;if(h.origin.push(w),o.origin.push(v),void 0===s)return h.towards.push(w),o.towards.push(v),s=w,void(a=v);var f=w>=s?h.towards:h.backwards,p=v>=a?o.towards:o.backwards;f.push(w),p.push(v),function(t){return void 0===e||t-e>=i}(g)&&function(i){e=i;var s=[].concat(h.history,h.origin),a=[].concat(o.history,o.origin),g=l(s),w=l(a);if(h.history=s.slice(),o.history=a.slice(),s.length>=10||a.length>=10){var v=m(s,g),f=m(a,w),p=Math.abs(v),b=Math.abs(f),y=v<.2&&f<.2;if(c[d]=p,u[d++]=b,y)return o.origin=[],o.towards=[],o.backwards=[],h.origin=[],h.towards=[],void(h.backwards=[])}s=h.towards.length>=h.backwards.length?h.towards:h.backwards,a=o.towards.length>=o.backwards.length?o.towards:o.backwards,g=l(s),w=l(a),n[0]=Object.assign({},n[0],{beta:g,gamma:w}),o.origin=[],o.towards=[],o.backwards=[],h.origin=[],h.towards=[],h.backwards=[],(h.history.length>=20||o.history.length>=20)&&(h.history=h.history.slice(-20),o.history=o.history.slice(-20)),t.apply(r,n)}(g)}}(function(t){this.camera.rotate(t.beta/6,t.gamma/6)}.bind(b),12);function k(t){if("keydown"===t.type){if(2===t.key.length&&"F"===t.key[0])return;if(t.ctrlKey||t.altKey||t.shiftKey)return}b.canvas.classList.add("hide"),window.removeEventListener("orientationchange",b.build),window.removeEventListener("resize",b.build),window.removeEventListener("deviceorientation",y),window.removeEventListener("click",k),window.removeEventListener("touchstart",k),window.removeEventListener("keydown",k),window.location.pathname="/blog/"}b.build(),window.addEventListener("orientationchange",b.build),window.addEventListener("resize",b.build),p.subscribe(function(){w.textContent="Press any button",document.addEventListener("click",k),document.addEventListener("touchstart",k),document.addEventListener("keydown",k)})}])});