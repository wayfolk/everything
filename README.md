![header image showing two bare feet coloured in australian red](_meta/_github/_readme/_assets/_images/wayfolk_githubheader_2000x810_16bit_sRGB.png?raw=true "wayfolk_githubheader")

###### haiku-ing
<sup>monorepo _git_\
sparse checkouts give breath —\
perforce lite</sup>

###### sparse clone-ing
<sup>Our default way of interacting with _everything_ is via sparse checkouts.<br><br>
Think of this approach as checking out a couple books from the library, rather than taking the entire institution home. Which becomes particulary relevant for checking out specific services that run stand-alone. Say we're dealing with a part of the monorepo that contains a codebase intended to run  somewhere in the cloud. We wouldn't want to pull in a massive amount of irrelevant data onto this particular edge node. (It might even break things as it's unlikely to have enough drive space allocated). So, what's the answer? You've guessed it; sparse checkouts. They're our best bet to help wrangle large datasets and help us avoid such a scenario.<br><br>A basic bit of advice would be to _only_ pull down what's relevant for your current context.<br><br>_note_ — if this workflow is reminiscent of Perforce's workspace mappings you'd not be wrong.</sup>

###### windows _meta store
```
# we rely on sparse checkouts to only pull in the data needed
# keep in mind this is not a security feature - the checkouts simply opt out of pulling in non-relevant data

cd C:\Midas\_work\_wayfolk\
git clone --filter=blob:none --no-checkout --depth 1 --sparse https://github.com/wayfolk/everything.git .\something
cd .\something\

# make sure we preserve our saved line-endings
git config core.autocrlf false

# setup user details
git config user.email "theun@theundebruijn.com"
git config user.name "Theun de Bruijn"

# populate env variables (example is for powershell)
$env:AWS_REGION=""; $env:AWS_ACCESS_KEY_ID=""; $env:AWS_SECRET_ACCESS_KEY=""; $env:AWS_S3_ENDPOINT="https://"; $env:S3_BUCKET=""; $env:S3_USEPATHSTYLE=1;

# setup custom lfs transferagent
# make sure lfs-s3 is on the path — https://github.com/nicolas-graves/lfs-s3
git config --add lfs.customtransfer.lfs-s3.path lfs-s3
git config --add lfs.standalonetransferagent lfs-s3
git config --add lfs.concurrenttransfers 10

# specify the (nested) folder(s) we'd like to pull in
git sparse-checkout add _meta/
git checkout

# (optionally) clear env variables (example is for powershell)
Remove-Item Env:\AWS_REGION; Remove-Item Env:\AWS_ACCESS_KEY_ID; Remove-Item Env:\AWS_SECRET_ACCESS_KEY; Remove-Item Env:\AWS_S3_ENDPOINT; Remove-Item Env:\S3_BUCKET;
```

###### wsl everything-ing
```
# our current workflow takes the majority of the work into wsl, with just the _meta aspects residing in Windows.

cd C:\Midas\_work\_wayfolk\something\_meta\_wsl\_provisioning\
.\provision.ps1

# note: to clone the secrets repo we need to manually use the token credentials (_github/theundebruijn/token) - once.

# from now on we perform all tasks from within the wsl instance
# assets / asset-sources can be saved directly onto the wsl filesystem from Windows
wsl -d everything -u wayfolk
```


###### non-sparse clone-ing
<sup>_warning_ — **this will be big**.<br>
its primary use-case would be to backup _everything_.</sup>
```
# pull in the base repo
git clone https://github.com/wayfolk/everything.git
cd <path to checkout dir>

# make sure we preserve our saved line-endings
git config core.autocrlf false

# setup user details
git config user.email "theun@theundebruijn.com"
git config user.name "Theun de Bruijn"

# setup custom lfs transferagent
# make sure lfs-s3 is on the path — https://github.com/nicolas-graves/lfs-s3
git config --add lfs.customtransfer.lfs-s3.path lfs-s3
git config --add lfs.standalonetransferagent lfs-s3
git config --add lfs.concurrenttransfers 10

# populate env variables (example is for powershell)
$env:AWS_REGION=""; $env:AWS_ACCESS_KEY_ID=""; $env:AWS_SECRET_ACCESS_KEY=""; $env:AWS_S3_ENDPOINT="https://"; $env:S3_BUCKET="";

# as the initial clone will have skipped the lfs content pull them in now
git reset --hard main
git lfs pull

# (optionally) clear env variables (example is for powershell)
Remove-Item Env:\AWS_REGION; Remove-Item Env:\AWS_ACCESS_KEY_ID; Remove-Item Env:\AWS_SECRET_ACCESS_KEY; Remove-Item Env:\AWS_S3_ENDPOINT; Remove-Item Env:\S3_BUCKET;
```
###### runn-ing
```
# these steps are post checkout + post provisioning

# powershell
wsl -d everything -u wayfolk

### WAYF0000 DEV ###

# bash
ip addr # (assign to windows host file as <ip> _local.wayfolk.com)
cd ~/_git/everything/
npm install
npm run wayf0000-install
npm run wayf0000-dev

### THEU0000 DEV ###

# bash
ip addr # (assign to windows host file as <ip> _local.theundebruijn.com)
cd ~/_git/everything/
npm install
npm run theu000-install
npm run theu000-dev

### ENGINE DEV ###

# bash
ip addr # (assign to windows host file as <ip> _local_engine.wayfolk.com)
cd ~/_git/everything/
npm install
npm run engine-install
npm run engine-dev

### RUNTIME DEV ###

# bash
cd ~/_git/everything/
npm install
npm run runtime-install
# this is actually a full build but instead of bundled assets we load (https://_local_engine.wayfolk.com)
# the reason for doing this is that we can't run the electron dev version for win32 from wsl
npm run runtime-dev
# run the .exe from C:\Midas\_work\_wayfolk\_temp
# to actually have something load in the runtime dev follow the ENGINE DEV steps above


# visit https://_local_engine.wayfolk.com

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
