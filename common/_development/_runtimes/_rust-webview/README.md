###### output
```
- native rust executable (Windows, Linux, macOS)
- iOS, Android support coming soon
- aot, not jit (should be possible)
- "backend" rust process
- "frontend" webview process w. full DOM support + web api's (webgl + webgpu, webaudio, gamepad, etc)
```

###### dependencies
```
- MSVC v143 - VS 2022 C++ x64/x86 build tools
- Windows 11 SDK
- node / npm
```

###### dev
```
npm run tauri dev
```

###### build local (win32 x64)
```
# see: rustc --print target-list
# BUG: this breaks?!
# npm run tauri build --target "x86_64-pc-windows-msvc"

# requires tauri.conf.json -> category to be: https://github.com/tauri-apps/tauri/commit/62182383de59a6ead275ba8e85f010b2a0704832
npm run tauri build

# build artifact(s) will be in:
- _codebase\src-tauri\target\release\bundle (.msi installer that makes sure webview2 is present)
- _codebase\src-tauri\target\release\<productName>.exe
```

```
////////////////////////////////////////////////////////////
//////////////////////////.        /////////////////////////
/////////////////////     .      ..  ...////////////////////
///////////////////    ..  .   ....    .  ./////////////////
//////////////////        . .  . ...  . ... ////////////////
/////////////////     ...................   ////////////////
/////////////////  .(,(/.%,.*%#&&&.//....   ////////////////
/////////////////  .***/..*,*/%,%%#%*/(/(. ,* //////////////
////////////////( ******  #%#((&%%*&///%%*..(.//////////////
/////////////////(/,((//**&.*,%%(*//.**##, .#(//////////////
///////////////( .(,**....* ...,*,,,%&,((*.* .//////////////
///////////////( . **..(*#/ %%%%#,*##,..*%,,.///////////////
////////////////(.,#/%#%%,#(%#(/&&(%,(.//#,..///////////////
//////////////////(,,/*#(.#/ /(&..%/&/(*(.//////////////////
///////////////////( ***#     .,.,/&%%%*.///////////////////
////////////////////(./,/*,,.,&*(((%%(/ ////////////////////
///////////////////////**.*.*//##.*,,,//////////////////////
///////////////////////  ,*%%/@//(*   ./////////////////////
//////////////////////                 /////////////////////
////////////////////                     ///////////////////

copyright © 2023-present Wayfolk, all rights reserved.
```