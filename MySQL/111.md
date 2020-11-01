# MySQL的delete操作与数据库空间
delete删除记录只是给数据库中的记录加一个删除标识了，这样数据库空间并不是减少了。一般表drop truncate操作才会直接释放空间的。delete 不会释放空间。在实际的使用中，我们会使用比较多的delete操作，这就会导致数据库的空间资源浪费。  
常见的delete使用方式：  
1. 当delete后面跟条件时(这是比较常见的现象)
2. 不带条件的delete

使用1的方法删除数据后，表的空间大小不会改变。使用2的方法删除数据后表的空间大小为0。  
当使用方法1删除数据导致数据库的空间资源浪费的问题的时候可以通过使用optimize table指令来对表进行优化。
命令语法：
```sql
OPTIMIZE [LOCAL | NO_WRITE_TO_BINLOG] TABLE tbl_name [, tbl_name] ...
```
最简单的：
```sql
optimize table phpernote_article
```

OPTIMIZE TABLE只对MyISAM, BDB和InnoDB表起作用。  
**注意：** 在OPTIMIZE TABLE运行过程中，MySQL会锁定表。因此，这个操作一定要在网站访问量较少的时间段进行。