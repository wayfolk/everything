##### PROVISION STEP 0001 - ROOT USER #####

dnf install -y passwd nano
useradd -G wheel wayfolk
passwd -d wayfolk


### let's grab the wsl config ###

cp /mnt/c/Midas/_work/_wayfolk/something/_meta/_wsl/_provisioning/_assets/wsl.conf /etc/


### and we're done here ###

exit