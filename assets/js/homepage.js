!function(t,i){"object"==typeof exports&&"object"==typeof module?module.exports=i():"function"==typeof define&&define.amd?define([],i):"object"==typeof exports?exports.AutoBtnColor=i():t.AutoBtnColor=i()}(window,function(){return function(t){var i={};function e(n){if(i[n])return i[n].exports;var r=i[n]={i:n,l:!1,exports:{}};return t[n].call(r.exports,r,r.exports,e),r.l=!0,r.exports}return e.m=t,e.c=i,e.d=function(t,i,n){e.o(t,i)||Object.defineProperty(t,i,{enumerable:!0,get:n})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,i){if(1&i&&(t=e(t)),8&i)return t;if(4&i&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(e.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&i&&"string"!=typeof t)for(var r in t)e.d(n,r,function(i){return t[i]}.bind(null,r));return n},e.n=function(t){var i=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(i,"a",i),i},e.o=function(t,i){return Object.prototype.hasOwnProperty.call(t,i)},e.p="",e(e.s=5)}([function(t,i){t.exports=function(t){var i=typeof t;return null!=t&&("object"==i||"function"==i)}},function(t){t.exports={"CenturyAlchemist-Pixiv-Novelance":{name:"CenturyAlchemist",from:"Pixiv",artist:"Novelance",ext:".JPG"},"祭-Pixiv-藤原":{name:"祭",from:"Pixiv",artist:"藤原",ext:".jpg"},"黒髪赤眼-Pixiv-NARU":{name:"黒髪赤眼",from:"Pixiv",artist:"NARU",ext:".png"}}},function(t,i,e){var n=e(8),r="object"==typeof self&&self&&self.Object===Object&&self,a=n||r||Function("return this")();t.exports=a},function(t,i,e){var n=e(2).Symbol;t.exports=n},function(t,i,e){var n=e(6),r=e(0),a="Expected a function";t.exports=function(t,i,e){var s=!0,o=!0;if("function"!=typeof t)throw new TypeError(a);return r(e)&&(s="leading"in e?!!e.leading:s,o="trailing"in e?!!e.trailing:o),n(t,i,{leading:s,maxWait:i,trailing:o})}},function(t,i,e){t.exports=e(16)},function(t,i,e){var n=e(0),r=e(7),a=e(10),s="Expected a function",o=Math.max,h=Math.min;t.exports=function(t,i,e){var u,c,f,l,d,v,m=0,p=!1,g=!1,w=!0;if("function"!=typeof t)throw new TypeError(s);function b(i){var e=u,n=c;return u=c=void 0,m=i,l=t.apply(n,e)}function y(t){var e=t-v;return void 0===v||e>=i||e<0||g&&t-m>=f}function x(){var t=r();if(y(t))return j(t);d=setTimeout(x,function(t){var e=i-(t-v);return g?h(e,f-(t-m)):e}(t))}function j(t){return d=void 0,w&&u?b(t):(u=c=void 0,l)}function k(){var t=r(),e=y(t);if(u=arguments,c=this,v=t,e){if(void 0===d)return function(t){return m=t,d=setTimeout(x,i),p?b(t):l}(v);if(g)return d=setTimeout(x,i),b(v)}return void 0===d&&(d=setTimeout(x,i)),l}return i=a(i)||0,n(e)&&(p=!!e.leading,f=(g="maxWait"in e)?o(a(e.maxWait)||0,i):f,w="trailing"in e?!!e.trailing:w),k.cancel=function(){void 0!==d&&clearTimeout(d),m=0,u=v=c=d=void 0},k.flush=function(){return void 0===d?l:j(r())},k}},function(t,i,e){var n=e(2);t.exports=function(){return n.Date.now()}},function(t,i,e){(function(i){var e="object"==typeof i&&i&&i.Object===Object&&i;t.exports=e}).call(this,e(9))},function(t,i){var e;e=function(){return this}();try{e=e||new Function("return this")()}catch(t){"object"==typeof window&&(e=window)}t.exports=e},function(t,i,e){var n=e(0),r=e(11),a=NaN,s=/^\s+|\s+$/g,o=/^[-+]0x[0-9a-f]+$/i,h=/^0b[01]+$/i,u=/^0o[0-7]+$/i,c=parseInt;t.exports=function(t){if("number"==typeof t)return t;if(r(t))return a;if(n(t)){var i="function"==typeof t.valueOf?t.valueOf():t;t=n(i)?i+"":i}if("string"!=typeof t)return 0===t?t:+t;t=t.replace(s,"");var e=h.test(t);return e||u.test(t)?c(t.slice(2),e?2:8):o.test(t)?a:+t}},function(t,i,e){var n=e(12),r=e(15),a="[object Symbol]";t.exports=function(t){return"symbol"==typeof t||r(t)&&n(t)==a}},function(t,i,e){var n=e(3),r=e(13),a=e(14),s="[object Null]",o="[object Undefined]",h=n?n.toStringTag:void 0;t.exports=function(t){return null==t?void 0===t?o:s:h&&h in Object(t)?r(t):a(t)}},function(t,i,e){var n=e(3),r=Object.prototype,a=r.hasOwnProperty,s=r.toString,o=n?n.toStringTag:void 0;t.exports=function(t){var i=a.call(t,o),e=t[o];try{t[o]=void 0;var n=!0}catch(t){}var r=s.call(t);return n&&(i?t[o]=e:delete t[o]),r}},function(t,i){var e=Object.prototype.toString;t.exports=function(t){return e.call(t)}},function(t,i){t.exports=function(t){return null!=t&&"object"==typeof t}},function(t,i,e){"use strict";e.r(i);var n=e(1),r=e(4),a=e.n(r);function s(t,i){if(!(t instanceof i))throw new TypeError("Cannot call a class as a function")}function o(t,i){for(var e=0;e<i.length;e++){var n=i[e];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function h(t,i,e){return i&&o(t.prototype,i),e&&o(t,e),t}var u=function(){function t(i,e,n){s(this,t);var r=document.createElement("canvas");r.classList.add("hide"),i.appendChild(r),this.img=e,this.imgLoader=n,this.canvas=r,this.ctx=r.getContext("2d"),this.container=i,this.build=this.build.bind(this)}return h(t,[{key:"setCamera",value:function(){this.camera=new m(this),window.addEventListener("deviceorientation",j)}},{key:"reset",value:function(){this.canvas.width=this.width=this.container.offsetWidth,this.canvas.height=this.height=this.container.offsetHeight,this.ctx.clearRect(0,0,this.width,this.height)}},{key:"build",value:function(){var t=this;this.reset(),this.imgLoader.subscribe(function(){t.canvas.classList.remove("hide"),t.setViewport(),t.ctx.drawImage(t.img,t.startX,t.startY,t.vw,t.vh,0,0,t.width,t.height),t.setCamera()})}},{key:"setViewport",value:function(){for(this.vw=this.width,this.vh=this.height;this.vw>this.img.width||this.vh>this.img.height;)this.vw=this.vw/1.001,this.vh=this.vh/1.001;this.img.width<this.img.height?(this.vw-=200,this.vh=this.vw*this.height/this.width):(this.vh-=200,this.vw=this.vh*this.width/this.height),this.startX=(this.img.width-this.vw)/2,this.startY=(this.img.height-this.vh)/2,this.img.height>=this.img.width&&(this.startY-=Math.min(this.startY,.118*this.img.height)),this.img.height<this.img.width&&(this.startY+=Math.min(this.img.height-this.startY-this.vh,.118*this.img.height),this.startX+=Math.min(this.img.width-this.startX-this.vw,.118*this.img.width))}},{key:"paint",value:function(t,i){this.ctx.drawImage(this.img,t,i,this.vw,this.vh,0,0,this.width,this.height)}}]),t}(),c=function(){function t(i){var e=this;s(this,t),this.element=i,this.callbacks=[],this.event=null,this.loaded=!1,this.element.addEventListener("load",function(t){console.log(e.callbacks),e.loaded=!0,e.event=t,e.callbacks.forEach(function(t){return t(e.event)})})}return h(t,[{key:"subscribe",value:function(t){var i=this;this.callbacks.push(t),this.loaded&&this.callbacks.forEach(function(t){return t(i.event)})}}]),t}();function f(t){return Math.tan(t/180*Math.PI)}var l,d,v,m=function(){function t(i){s(this,t),this.painter=i,this.sightDistance=1/96*2.54*20,this.lastBeta=void 0,this.lastGamma=void 0,this.anchorBeta=void 0,this.anchorGamma=void 0,this.restoreTime=null,this.betaCounter=0,this.gammaCounter=0,this.ticking=!1}return h(t,[{key:"rotate",value:function(t,i){var e=this;try{if(this.lastBeta=t,this.lastGamma=i,this.ticking)return;if(void 0===this.anchorBeta){var n=Math.sqrt(Math.max(Math.pow(x.startX,2)+Math.pow(x.startY,2),Math.pow(x.startX,2)+Math.pow(x.img.height-x.startY,2),Math.pow(x.img.width-x.startX,2)+Math.pow(x.startY,2),Math.pow(x.img.width-x.startX,2)+Math.pow(x.img.height-x.startY,2)));return this.lastX=this.painter.startX,this.lastY=this.painter.startY,this.anchorBeta=t,this.anchorGamma=i,this.step=Math.abs(n/f(30-t)),void(this.duration=.4)}var r=this.painter.startX-f(i-this.anchorGamma)*this.step,a=this.painter.startY-f(t-this.anchorBeta)*this.step;if(Math.abs(r-this.lastX)<3&&Math.abs(a-this.lastY)<3)return;r<0&&(r=0),r+this.painter.vw>this.painter.img.width&&(r=this.painter.img.width-this.painter.vw),a<0&&(a=0),a+this.painter.vh>this.painter.img.height&&(a=this.painter.img.height-this.painter.vh),this.lastX=r,this.lastY=a,this.painter.paint(r,a),0===r||r===this.painter.img.width-this.painter.vw?this.gammaCount++:this.gammaCount=0,0===a||a===this.painter.img.height-this.painter.vh?this.betaCount++:this.betaCount=0,(this.gammaCount>=48||this.betaCount>=48)&&(this.ticking=!0,this.gammaCount=0,this.betaCount=0,this.cubicBezier=function(t,i,e,n){var r=1-3*e+3*t-0,a=3*e-6*t+0,s=3*t-0,o=1-3*n+3*i-0,h=3*n-6*i+0,u=3*i-0;function c(t,i,e,n){return 1/(3*i*t*t+2*e*t+n)}function f(t,i,e,n,r){return i*(t*t*t)+e*(t*t)+n*t+r}return function(t){for(var i=t,e=0;e<5;e++)(i-=(f(i,r,a,s,0)-t)*c(i,r,a,s))<0&&(i=0),i>1&&(i=1);return function(t,i,e,n,r){return i*(t*t*t)+e*(t*t)+n*t+r}(i,o,h,u,0)}}(0,0,.58,1),window.requestAnimationFrame(function(t){return e.restore(t)}))}catch(t){alert(t)}}},{key:"restore",value:function(t){var i=this;try{if(null===this.restoreTime)return this.restoreTime=t,void window.requestAnimationFrame(function(t){return i.restore(t)});var e=this.lastX+(this.painter.startX-this.lastX)*this.cubicBezier((t-this.restoreTime)/1e3/this.duration),n=this.lastY+(this.painter.startY-this.lastY)*this.cubicBezier((t-this.restoreTime)/1e3/this.duration);if(this.painter.paint(e,n),(this.lastX-e)*(e-this.painter.startX)<=0&&(this.lastY-n)*(n-this.painter.startY)<=0)return this.restoreTime=null,this.anchorBeta=this.lastBeta,this.anchorGamma=this.lastGamma,void(this.ticking=!1);window.requestAnimationFrame(function(t){return i.restore(t)})}catch(t){alert(t)}}}]),t}(),p=document.getElementById("home-root"),g=document.getElementById("arcade-hint"),w=(l=Object.keys(n),d=l[Math.floor(Math.random()*l.length)],v=n[d],{url:"assets/img/Paintings/".concat(d).concat(v.ext)}),b=new Image;b.src=w.url;var y=new c(b),x=new u(p,b,y),j=a()(function(t){this.camera.rotate(t.beta,t.gamma)}.bind(x),1e3/60);function k(t){if("keydown"===t.type){if(2===t.key.length&&"F"===t.key[0])return;if(t.ctrlKey||t.altKey||t.shiftKey)return}x.canvas.classList.add("hide"),window.removeEventListener("orientationchange",x.build),window.removeEventListener("deviceorientation",j),window.removeEventListener("click",k),window.removeEventListener("touchstart",k),window.removeEventListener("keydown",k),window.location.pathname="/blog"}x.build(),window.addEventListener("orientationchange",x.build),y.subscribe(function(){g.textContent="Press any button",document.addEventListener("click",k),document.addEventListener("touchstart",k),document.addEventListener("keydown",k)})}])});