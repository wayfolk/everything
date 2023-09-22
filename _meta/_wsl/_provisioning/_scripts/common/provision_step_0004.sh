##### PROVISION STEP 0004 - WAYFOLK USER #####

# grab iproute to be able to use `ip addr`
sudo dnf install -y iproute

# we need wine to build electron for win32 on linux - https://github.com/electron/electron-packager#building-windows-apps-from-non-windows-platforms
# TODO: see if we can remove this requirement by exposing the windows path via interopt
# sudo dnf install -y wine

### check to make sure things are available on the path/env ###

node --version
npm --version
lfs-s3 --version


### lets make a sparse-checkout ###

cd /home/wayfolk/_git/

# git clone --filter=blob:none --no-checkout --depth 1 --sparse git@github.com:wayfolk/everything.git ./something/
# cd something/

git clone git@github.com:wayfolk/everything.git
cd everything/

git config user.email "theun@theundebruijn.com"
git config user.name "Theun de Bruijn"

# setup custom lfs transferagent
# make sure lfs-s3 is on the path — https://github.com/nicolas-graves/lfs-s3
git config --add lfs.customtransfer.lfs-s3.path lfs-s3
git config --add lfs.standalonetransferagent lfs-s3
git config --add lfs.concurrenttransfers 10

echo "ok. let's try that again."

# as the initial clone will have skipped the lfs content pull them in now
git reset --hard main
git lfs pull

echo "nice."


### copy over ssl certs from secrets ###
cp -r /home/wayfolk/_git/secrets/_certs /home/wayfolk/_git/everything/common/_development/_web/_server/


### and we're done here ###

exit