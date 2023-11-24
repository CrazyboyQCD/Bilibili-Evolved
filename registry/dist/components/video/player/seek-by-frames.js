!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["video/player/seek-by-frames"]=t():e["video/player/seek-by-frames"]=t()}(globalThis,(()=>(()=>{"use strict";var e,t,r={833:e=>{e.exports=coreApis.componentApis.video.playerAgent}},o={};function n(e){var t=o[e];if(void 0!==t)return t.exports;var a=o[e]={exports:{}};return r[e](a,a.exports,n),a.exports}t=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,n.t=function(r,o){if(1&o&&(r=this(r)),8&o)return r;if("object"==typeof r&&r){if(4&o&&r.__esModule)return r;if(16&o&&"function"==typeof r.then)return r}var a=Object.create(null);n.r(a);var s={};e=e||[null,t({}),t([]),t(t)];for(var i=2&o&&r;"object"==typeof i&&!~e.indexOf(i);i=t(i))Object.getOwnPropertyNames(i).forEach((e=>s[e]=()=>r[e]));return s.default=()=>r,n.d(a,s),a},n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var a={};return(()=>{n.d(a,{component:()=>l});const e=coreApis.componentApis.video.videoControlBar,t=coreApis.observer,r=coreApis.utils,o=coreApis.utils.urls,s=coreApis.pluginApis.data,i=coreApis.componentApis.define,c="seek-by-frame-disable",l=(0,i.defineComponentMetadata)({name:"seekByFrames",displayName:"启用逐帧调整",tags:[componentsTags.video],description:{"zh-CN":"在播放器的时间右边增加两个按钮, 用于**较精细**调整视频时间. 装有 `快捷键扩展` 时支持键盘快捷键<kbd>Shift</kbd>+<kbd>←</kbd>/<kbd>→</kbd>.\n\n> 注: `视频的实际播放帧率`跟`视频本身的帧率`和`显示器的刷新率`有关, 很难计算一个精准的数值, 部分视频仍然会有暂停不到那种一闪而过的图的情况."},entry:async()=>{await(0,r.playerReady)();const{playerAgent:o}=await Promise.resolve().then(n.t.bind(n,833,23));(0,s.addData)("ui.icons",(e=>{e["seek-left"]='<?xml version="1.0" encoding="utf-8"?>\n\x3c!-- Generator: Adobe Illustrator 24.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  --\x3e\n<svg version="1.1" id="图层_2_1_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"\n\t y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">\n<g>\n\t<path d="M15.5,20.3c-0.4,0-0.7-0.1-1-0.4l-8.3-7.5c-0.3-0.3-0.5-0.7-0.5-1.1c0-0.4,0.2-0.8,0.5-1.1l8.3-7.5\n\t\tc0.6-0.6,1.6-0.5,2.1,0.1c0.6,0.6,0.5,1.6-0.1,2.1l-7.1,6.3l7.1,6.4c0.6,0.6,0.7,1.5,0.1,2.1C16.3,20.2,15.9,20.3,15.5,20.3z"/>\n</g>\n<circle cx="16.8" cy="11.3" r="2.4"/>\n</svg>\n',e["seek-right"]='<?xml version="1.0" encoding="utf-8"?>\n\x3c!-- Generator: Adobe Illustrator 24.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  --\x3e\n<svg version="1.1" id="图层_2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n\t viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">\n<g>\n\t<path d="M8.2,20.3c0.4,0,0.7-0.1,1-0.4l8.3-7.5c0.3-0.3,0.5-0.7,0.5-1.1c0-0.4-0.2-0.8-0.5-1.1L9.2,2.7C8.6,2.2,7.7,2.2,7.1,2.9\n\t\tC6.6,3.5,6.6,4.4,7.3,5l7.1,6.3l-7.1,6.4c-0.6,0.6-0.7,1.5-0.1,2.1C7.4,20.2,7.8,20.3,8.2,20.3z"/>\n</g>\n<circle cx="7" cy="11.3" r="2.4"/>\n</svg>\n'}));let a=0;(0,t.attributesSubtree)(`${o.query.control.buttons.quality.selector} ul`,(()=>{const e=dq(`${o.query.control.buttons.quality.selector} .bui-select-item-active, ${o.query.control.buttons.quality.selector} .active`),t=e?parseInt(e.getAttribute("data-value")):0,r=(()=>{switch(t){case 116:case 74:return 6e4/1001;default:return 3e4/1001}})();a=1/r}));const i=e=>{o.changeTime(e*a)};(0,e.addControlBarButton)({name:"seekPrevFrame",displayName:"上一帧",icon:"seek-left",order:1,action:()=>{i(-1)}}),(0,e.addControlBarButton)({name:"seekNextFrame",displayName:"下一帧",icon:"seek-right",order:2,action:()=>{i(1)}})},reload:()=>document.body.classList.remove(c),unload:()=>document.body.classList.add(c),urlInclude:o.playerUrls,plugin:{displayName:"逐帧调整 - 快捷键支持",setup:()=>{(0,s.addData)("keymap.actions",(e=>{e.previousFrame={displayName:"上一帧",run:e=>{const{clickElement:t}=e;return t('.be-video-control-bar-extend [data-name="seekPrevFrame"]',e)}},e.nextFrame={displayName:"下一帧",run:e=>{const{clickElement:t}=e;return t('.be-video-control-bar-extend [data-name="seekNextFrame"]',e)}}})),(0,s.addData)("keymap.presets",(e=>{e.previousFrame="shift arrowLeft",e.nextFrame="shift arrowRight"}))}},commitHash:"888d62c6cbe1ebc18b0dab31777548591b3997f8",coreVersion:"2.8.7"})})(),a=a.component})()));