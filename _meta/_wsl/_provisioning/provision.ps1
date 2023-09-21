# builds _wsl instances across everything

cd ..\_distros\
7za.exe x Fedora-Container-Base-38-20230912.0.x86_64.tar.xz
7za.exe x Fedora-Container-Base-38-20230912.0.x86_64.tar
cd ..\_provisioning\

$instances = 'everything'

foreach ($instance in $instances)
{
  $expression = 'wsl.exe --import ' + $instance + ' ..\_instances\' + $instance + ' ..\_distros\e24db22a5019c6f6a2cd7000de0171580a572d38ada5dca7c9b2fcf345ed4c57\layer.tar'
  Write-Output $expression
  Invoke-Expression $expression

  # provision
  $wsl_root_bash = 'wsl.exe --distribution ' + $instance + ' --user root -e /bin/bash -li -c '
  $wsl_wayfolk_bash = 'wsl.exe --distribution ' + $instance + ' --user wayfolk -e /bin/bash -li -c '

  $wsl_terminate = 'wsl.exe --terminate '
  $wsl_unregister = 'wsl.exe --unregister '

  $expression = $wsl_root_bash + '/mnt/c/Midas/_work/_wayfolk/_wsl/_provisioning/_scripts/common/provision_step_0001.sh'
  Write-Output $expression
  Invoke-Expression $expression

  $expression = $wsl_terminate + $instance
  Write-Output $expression
  Invoke-Expression $expression

  $expression = $wsl_wayfolk_bash + '/mnt/c/Midas/_work/_wayfolk/_wsl/_provisioning/_scripts/common/provision_step_0002.sh'
  Write-Output $expression
  Invoke-Expression $expression

  $expression = $wsl_wayfolk_bash + '/mnt/c/Midas/_work/_wayfolk/_wsl/_provisioning/_scripts/common/provision_step_0003.sh'
  Write-Output $expression
  Invoke-Expression $expression

  $expression = $wsl_terminate + $instance
  Write-Output $expression
  Invoke-Expression $expression

  $expression = $wsl_wayfolk_bash + '/mnt/c/Midas/_work/_wayfolk/_wsl/_provisioning/_scripts/common/provision_step_0004.sh'
  Write-Output $expression
  Invoke-Expression $expression
}

cd ..\_distros\
Remove-Item .\manifest.json
Remove-Item .\repositories
Remove-Item .\Fedora-Container-Base-38-20230912.0.x86_64.tar
Remove-Item .\7c7d4242b4f3cb2531234e6b468f80a547dccc7133037e1abd4f6ac2657362ce.json
Remove-Item -Recurse .\e24db22a5019c6f6a2cd7000de0171580a572d38ada5dca7c9b2fcf345ed4c57\
cd ..\_provisioning\
