$instances = 'everything'

foreach ($instance in $instances)
{
  $expression = 'wsl.exe --terminate ' + $instance
  Write-Output $expression
  Invoke-Expression $expression

  $expression = 'wsl.exe --unregister ' + $instance
  Write-Output $expression
  Invoke-Expression $expression

  $expression = '..\_instances\' + $instance
  Remove-Item -Recurse $expression
}
