# nvm切换Node版本不生效问题

在使用nvm管理Node的版本的时候，在Centos 7 上使用nvm安装Node的版本，之后使用nvm切换Node的版本，会出现下面的提示：

```sh
nvm is not compatible with the npm config "prefix" option: currently set to "/home/.nvm/versions/node/v10.23.0"
Run `nvm use --delete-prefix v10.23.0 --silent` to unset it.
```

并且Node版本切换失败，当前系统无法找到Node的安装路径，表现为Node相关的指令无法执行：

```sh
[root ~]$ nvm use v10.23.0
nvm is not compatible with the npm config "prefix" option: currently set to "/data/home/ops/.nvm/versions/node/v10.23.0"
Run `nvm use --delete-prefix v10.23.0` to unset it.
[root ~]$ node
-bash: node: command not found
[root ~]$ npm
-bash: npm: command not found
```

官方文档：[nvm](https://github.com/nvm-sh/nvm)，文档的最后有说明这种问题出现的原因和部分issue中有提到这个问题的解决办法，现整理如下：

### $HOME与用户实际的home目录不一致

官方的原话是：

```
There is one more edge case causing this issue, and that's a **mismatch between the `$HOME` path and the user's home directory's actual name.
```

大致的意识就是系统的环境变量$HOME与你当前实际工作的home目录不一致，将$HOME的值修改为当前实际的home路径即可。



