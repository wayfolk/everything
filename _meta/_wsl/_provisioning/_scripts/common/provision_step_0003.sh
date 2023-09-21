##### PROVISION STEP 0003 - WAYFOLK USER #####

sudo dnf install -y git git-lfs


### lets pull in our secrets ###

mkdir /home/wayfolk/_git/
cd /home/wayfolk/_git/

# this requires our username/pass as it contains our ssh key(s)
# after this we use those for the everything repo
git clone https://github.com/wayfolk/secrets


### copy ssh keys
mkdir /home/wayfolk/.ssh/
cp -r /home/wayfolk/_git/secrets/_github/theundebruijn/. /home/wayfolk/.ssh/
chmod 700 /home/wayfolk/.ssh/
chmod 644 /home/wayfolk/.ssh/id_ed25519_github_theundebruijn.pub
chmod 600 /home/wayfolk/.ssh/id_ed25519_github_theundebruijn


echo 'eval "$(ssh-agent -s)"' >> ~/.bash_profile
echo "ssh-add /home/wayfolk/.ssh/id_ed25519_github_theundebruijn" >> ~/.bash_profile


### load env variables

source /home/wayfolk/_git/secrets/_env/_wsl/common/env.sh
echo "source /home/wayfolk/_git/secrets/_env/_wsl/common/env.sh" >> ~/.bash_profile