##### PROVISION STEP 0002 - WAYFOLK USER #####

sudo dnf install -y xz


### let's grab node + npm ###

# https://nodejs.org/en/download/current
var_nodeVer=20.7.0

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

# here's how to build lfs-s3 from scratch
# unless needed we simply copy over the x.x.x. artifact\
# sudo dnf install -y golang

# curl -OL https://github.com/nicolas-graves/lfs-s3/archive/refs/tags/0.1.5.tar.gz
# tar -xvf ./0.1.5.tar.gz
# cd ./lfs-s3-0.1.5/
# go build

mkdir lfs-s3/
cp /mnt/c/Midas/_work/_wayfolk/something/_meta/_wsl/_provisioning/_assets/lfs-s3 /home/wayfolk/_tools/lfs-s3/

export PATH=$PATH:/home/wayfolk/_tools/lfs-s3/
echo $PATH
echo "export PATH=$PATH:/home/wayfolk/_tools/lfs-s3/" >> ~/.bash_profile


### and we're done here ###

exit
