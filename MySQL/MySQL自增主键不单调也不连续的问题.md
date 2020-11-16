# MySQL自增主键不单调也不连续的问题

在MySLQL中如果使用了系统的自增主键时，会出现主键不单调也不连续的情况，具体的情况有：

- 插入新数据时，主键冲突，插入失败
- 表中id=xxx的行不存在

要理解上面的情况，首先要明白mysql自增主键：AUTO_INCREMENT的设计思路和特性：

- 较早版本的MySQL将AUTO_INCREMENT存储在内存中，实例重启后会根据表中的数据重新设置AUTO_INCREMENT
- 获取AUTO_INCREMENT时不会使用事务锁，并发的插入事务可能出现主键冲突导致插入失败

下面进行具体的说明（主要以InnoDB为说明对象）。

较早版本的MySQL将AUTO_INCREMENT存储在内存中，存储的是当前的AUTO_INCREMENT的值，当有记录插入时，MySQL客户端会获取该值作为新纪录的ID，同时将该值加一。由于AUTO_INCREMENT是存储在内存中的，当实例重启后，该值被清除。当实例重启后第一次插入数据时，客户端会根据当前表的数据重新恢复AUTO_INCREMENT的值，具体的做法是：查找当前表ID的最大值，将其加一后最为带插入记录的主键并作为AUTO_INCREMENT的值。使用的语句如下：

```mysql
SELECT MAX(ai_col) FROM table_name FOR UPDATE;
```

这样就会导致表的ID不连续，举个例子：



