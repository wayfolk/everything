###### commands performed on:
###### wayf0000-linode-uswest-0001, wayf0000-linode-eucentral-0001, wayf0000-linode-apsouth-0001


###### 2023.10.08

```
# ssh root@<ip>

hostnamectl set-hostname <insert instance label>

dnf up --refresh

dnf install -y passwd
useradd -G wheel wayfolk
passwd wayfolk

exit
```

###### 2023.10.09

```
# ssh wayfolk@<ip>

var_nodeVer=20.8.0

mkdir /home/wayfolk/_runtimes/

var_nodeVer=20.8.0

mkdir /home/wayfolk/_runtimes/
cd /home/wayfolk/_runtimes/

curl https://nodejs.org/dist/v${var_nodeVer}/node-v${var_nodeVer}-linux-x64.tar.xz --output ./node-v${var_nodeVer}-linux-x64.tar.xz
tar -xvf ./node-v${var_nodeVer}-linux-x64.tar.xz
rm node-v${var_nodeVer}-linux-x64.tar.xz

export PATH=$PATH:/home/wayfolk/_runtimes/node-v${var_nodeVer}-linux-x64/bin/
echo $PATH
echo "export PATH=$PATH:/home/wayfolk/_runtimes/node-v${var_nodeVer}-linux-x64/bin/" >> ~/.bash_profile

sudo setcap CAP_NET_BIND_SERVICE=+eip /home/wayfolk/_runtimes/node-v${var_nodeVer}-linux-x64/bin/node


### next up is lfs-s3 ###

mkdir /home/wayfolk/_tools/
cd /home/wayfolk/_tools/

sudo dnf install -y golang

curl -OL https://github.com/nicolas-graves/lfs-s3/archive/refs/tags/0.1.5.tar.gz
tar -xvf ./0.1.5.tar.gz
cd ./lfs-s3-0.1.5/
go build

export PATH=$PATH:/home/wayfolk/_tools/lfs-s3-0.1.5/
echo $PATH
echo "export PATH=$PATH:/home/wayfolk/_tools/lfs-s3-0.1.5/" >> ~/.bash_profile

exit
```

###### relog

```
sudo dnf install git-lfs

mkdir /home/wayfolk/_git/
cd /home/wayfolk/_git/

# clone using github token
git clone https://github.com/wayfolk/secrets
cd /home/wayfolk/_git/secrets/
git config user.email "theun@theundebruijn.com"
git config user.name "Theun de Bruijn"

mkdir /home/wayfolk/.ssh/
cp -r /home/wayfolk/_git/secrets/_github/theundebruijn/. /home/wayfolk/.ssh/
rm ~/.ssh/token

chmod 700 /home/wayfolk/.ssh/
chmod 644 /home/wayfolk/.ssh/id_ed25519_github_theundebruijn.pub
chmod 600 /home/wayfolk/.ssh/id_ed25519_github_theundebruijn

ls -la ~/.ssh/

echo 'eval "$(ssh-agent -s)"' >> ~/.bash_profile
echo "ssh-add /home/wayfolk/.ssh/id_ed25519_github_theundebruijn" >> ~/.bash_profile

source /home/wayfolk/_git/secrets/_env/_wsl/common/env.sh
echo "source /home/wayfolk/_git/secrets/_env/_wsl/common/env.sh" >> ~/.bash_profile

exit
```

###### relog

```
cd /home/wayfolk/_git/

# make a sparse clone - accept the key fingerprint from github
# TODO: figure out what breaks if we do this (we get missing lfs object errors)
#       cause the way we're using it now might waste diskspace
#       is it the bloc setting? https://github.com/git-lfs/git-lfs/issues/4335
<!-- git clone --filter=blob:none --no-checkout --depth 1 --sparse git@github.com:wayfolk/everything.git ./something/ -->
git clone --no-checkout git@github.com:wayfolk/everything.git ./something/
cd /home/wayfolk/_git/something/
git sparse-checkout init

git config user.email "theun@theundebruijn.com"
git config user.name "Theun de Bruijn"

git config --add lfs.customtransfer.lfs-s3.path lfs-s3
git config --add lfs.standalonetransferagent lfs-s3
git config --add lfs.concurrenttransfers 10

# now pull in the relevant dirs

git sparse-checkout add common/_development/_web/
git sparse-checkout add wayf0000/_development/_web/
git checkout
git lfs pull

# with the folder structure set, copy over the ssl certs
cp -r /home/wayfolk/_git/secrets/_certs /home/wayfolk/_git/something/common/_development/_web/_server/

# npm
cd /home/wayfolk/_git/something/
npm install
npm run install-all

npm run projects-wayf0000-build
npm run projects-theu0000-build

npm run pm2-server-start

# make sure we open up the fedora firewall permanently for http (:80) and https (:443)
sudo firewall-cmd --add-service http --permanent
sudo firewall-cmd --add-service https --permanent
sudo firewall-cmd --reload
```

###### presto

###### update

```
cd /home/wayfolk/_git/something/

git pull
git lfs pull

npm install
npm run install-all

npm run projects-wayf0000-build
npm run projects-theu0000-build

npm run pm2-server-reload
```