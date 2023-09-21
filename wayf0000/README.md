###### wsl
```
# add existing .vhdx (use if present)

cd C:\Midas\_work\_wayfolk\_git\everything\wayf0000\_development\_web\_wsl\
wsl --import-in-place wayf0000-development-web-0001 '_instances\wayf0000-development-web-0001\ext4.vhdx'
```
```
# create new instance(s)

cd C:\Midas\_work\_wayfolk\_git\everything\wayf0000\_development\_web\_wsl\_distros\
7za.exe x .\Fedora-Container-Base-38-20230912.0.x86_64.tar.xz
7za.exe x .\Fedora-Container-Base-38-20230912.0.x86_64.tar
wsl --import wayf0000-development-web-0001 '..\_instances\wayf0000-development-web-0001\' 'e24db22a5019c6f6a2cd7000de0171580a572d38ada5dca7c9b2fcf345ed4c57\layer.tar'
# cleanup
```
```
# provision new instance(s)

# powershell
wsl -d wayf0000-development-web-0001

# wsl bash (root)
dnf install -y passwd nano
useradd -G wheel wayfolk
passwd wayfolk

nano /etc/wsl.conf
`
[interop]
enabled = false
appendWindowsPath = false

[network]
hostname = wayf0000-development-web-0001
generateHosts=false

[user]
default = wayfolk
`
exit

# powershell
wsl --terminate wayf0000-development-web-0001
wsl -d wayf0000-development-web-0001 -u wayfolk

# wsl bash (wayfolk)
sudo dnf install -y xz

# https://nodejs.org/en/download/current
var_nodeVer=20.6.1
mkdir /home/wayfolk/_runtimes/
cd /home/wayfolk/_runtimes/
curl https://nodejs.org/dist/v${var_nodeVer}/node-v${var_nodeVer}-linux-x64.tar.xz --output ./node-v${var_nodeVer}-linux-x64.tar.xz
tar -xvf ./node-v${var_nodeVer}-linux-x64.tar.xz
rm node-v${var_nodeVer}-linux-x64.tar.xz
echo "export PATH=$PATH:/home/wayfolk/_runtimes/node-v${var_nodeVer}-linux-x64/bin/" >> ~/.bashrc
exit

# powershell
wsl -d wayf0000-development-web-0001 -u wayfolk

# wsl bash (wayfolk)
node --version
npm --version

# grant access to low-numbered ports without sudo
# https://superuser.com/a/892391
var_nodeVer=20.6.1
sudo setcap CAP_NET_BIND_SERVICE=+eip /home/wayfolk/_runtimes/node-v${var_nodeVer}-linux-x64/bin/node

sudo dnf install -y git git-lfs

mkdir /home/wayfolk/_tools/
cd /home/wayfolk/_tools/

# TODO: let's pull a static build from somewhere instead of building on the spot
sudo dnf install -y golang

git clone https://github.com/nicolas-graves/lfs-s3.git
cd lfs-s3/
go build
echo "export PATH=$PATH:/home/wayfolk/_tools/lfs-s3/" >> ~/.bashrc
exit
```
```
# sparse checkout in new instance(s)

# powershell
wsl -d wayf0000-development-web-0001 -u wayfolk

# wsl bash (wayfolk)
mkdir /home/wayfolk/_git/
cd /home/wayfolk/_git/

git clone --filter=blob:none --no-checkout --depth 1 --sparse https://github.com/wayfolk/everything.git ./something/
cd something/

# setup custom lfs transferagent
# make sure lfs-s3 is on the path — https://github.com/nicolas-graves/lfs-s3
git config --add lfs.customtransfer.lfs-s3.path lfs-s3
git config --add lfs.standalonetransferagent lfs-s3
git config --add lfs.concurrenttransfers 10

# populate env variables (example is for powershell)
$env:AWS_REGION=""; $env:AWS_ACCESS_KEY_ID=""; $env:AWS_SECRET_ACCESS_KEY=""; $env:AWS_S3_ENDPOINT="https://"; $env:S3_BUCKET="";

# specifiy the (nested) folder(s) we'd like to pull in
git sparse-checkout add common/_development/_web/_builder/ wayf0000/_development/_web/_codebase/
git checkout
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