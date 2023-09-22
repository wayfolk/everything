import packager  from "electron-packager";
import setLanguages from "electron-packager-languages";

// https://electron.github.io/electron-packager/main/index.html
// https://electron.github.io/electron-packager/main/modules/electronpackager.html

let options =
{
  name: "wayfolk-runtime",
  appVersion: "0.0.1",
  appBundleId: "com.wayfolk.runtime",
  appCopyright: "copyright © 2023-present Wayfolk, all rights reserved.",
  dir: ".",
  ignore: "^/_src",
  asar: false,
  out: "_dist",
  overwrite: true,
  //icon: ,
  prune: true,
  afterCopy:
  [
    setLanguages(['en_GB'])
  ]
};

// building this on linux requires wine - see https://github.com/electron/electron-packager#building-windows-apps-from-non-windows-platforms
let optionsWindows =
{
  platform: "win32",
  arch: "x64",
  // win32metadata:
  // {
  //   "CompanyName": "Wayfolk",
  //   "FileDescription": "wayfolk-runtime",
  //   "InternalName": "wayfolk-runtime",
  //   "ProductName": "wayfolk-runtime",
  // },
};

let optionsMac =
{
  platform: "darwin",
  arch: "arm64",
  appCategoryType: "Entertainment",
};

let optionsLinux =
{
  platform: "linux",
  arch: "x64",
};

let promises = [
  packager({...options, ...optionsWindows}),
  packager({...options, ...optionsMac}),
  packager({...options, ...optionsLinux}),
];

Promise.all(promises)
.then(function(values) {
  console.log("done")
});