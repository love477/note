# MySQL自增主键不单调也不连续的问题

在MySLQL中如果使用了系统的自增主键时，会出现主键不单调也不连续的情况，具体的情况有：

- 插入新数据时，主键冲突，插入失败
- 表中id=xxx的行不存在

要理解上面的情况，首先要明白mysql自增主键：AUTO_INCREMENT的设计思路和特性：

- 较早版本的MySQL将AUTO_INCREMENT存储在内存中，实例重启后会根据表中的数据重新设置AUTO_INCREMENT
- 获取AUTO_INCREMENT时不会使用事务锁，并发的插入事务可能出现主键冲突导致插入失败

下面进行具体的说明（主要以InnoDB为说明对象）。

## 不单调问题

较早版本的MySQL将AUTO_INCREMENT存储在内存中，存储的是当前的AUTO_INCREMENT的值，当有记录插入时，MySQL客户端会获取该值作为新纪录的ID，同时将该值加一。由于AUTO_INCREMENT是存储在内存中的，当实例重启后，该值被清除。当实例重启后第一次插入数据时，客户端会根据当前表的数据重新恢复AUTO_INCREMENT的值，具体的做法是：查找当前表ID的最大值，将其加一后最为带插入记录的主键并作为AUTO_INCREMENT的值。使用的语句如下：

```mysql
SELECT MAX(ai_col) FROM table_name FOR UPDATE;
```

这样就会使表的ID不单调，从而导致数据库的数据不一致，举个例子，现在有两张表：

```sql
// 用户行程
create table `user_itinerary` (
	`id` bigint(20) NOT NULL AUTO_INCREMENT,
  `car_itinerary_id` bigint(20) NOT NULL,
  ...
  PRIMARY KEY(`id`),
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

// 车辆行程
create table `car_itinerary` (
	`id` bigint(20) NOT NULL AUTO_INCREMENT,
  ...
  PRIMARY KEY(`id`),
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4
```

假定，现在car_itinerary的AUTO_INREMENT = 1000，此时新增一条行程记录：

```sql
insert into car_itinerary(id, ...) values(null, ...); // 新增数据后AUTO_INCREMENT = 10001
update user_itinerary set car_itinerary_id = 1000 where id=1000;

// 由于某些原因，删除了一条车辆的行程数据
delete from car_itinerary where id = 1000;
```

若此时MySQL实例重启，由于AUTO_INREMENT是在内存中的，所以car_itinerary表的AUTO_INREMENT数据清楚，MySQL会使用car_itinerary表中id的最大值恢复AUTO_INREMENT的值，此时id的最大值为：1000，所以此时car_itinerary的AUTO_INREMENT为1000。后续新增的car_itinerary的记录的id会从1000开始自增，而在user_itinerary表中已经引用了car_itinerary_id=1000的数据，所以会导致user_itinerary表中出现错误的car-itinerary记录。

庆幸的是，这个问题官方已经在MySQL8.0的版本中修复了：

```
In MySQL 8.0, this behavior is changed. The current maximum auto-increment counter value is written to the redo log each time it changes and is saved to an engine-private system table on each checkpoint. These changes make the current maximum auto-increment counter value persistent across server restarts.
```

大致的意思是：，`AUTO_INCREMENT` 计数器的初始化行为发生了改变，每次计数器的变化都会写入到系统的重做日志（Redo log）并在每个检查点存储在引擎私有的系统表中。

当 MySQL 服务被重启或者处于崩溃恢复时，它可以从持久化的检查点和重做日志中恢复出最新的 `AUTO_INCREMENT` 计数器，避免出现不单调的主键也解决了这里提到的问题。

## 不连续问题

自增id不连续的问题主要是由数据库并发写入导致的。这个现象背后的原因也很简单，虽然在获取 `AUTO_INCREMENT` 时会加锁，但是该锁是语句锁，它的目的是保证 `AUTO_INCREMENT` 的获取不会导致线程竞争，而不是保证 MySQL 中主键的连续。

```
// 事务1，假定此时AUTO_INCREMENT=100
insert into user_itinerary(id,...) values(null,...);

// 同时执行的事务2，假定此时AUTO_INCREMENT=101
insert into user_itinerary(id,...) values(null,...);
```

如果上面的事务1执行失败回滚，那么数据库中的id会是下面的情况：

```
...99,101...
```

中间的100由于回滚为丢失。若是想解决这个问题，就只能使用数据库的最高隔离级别：可串行化（serialiable）。但是这会带来性能的下降，具体的选择需要使用者权衡。

## 总结

上面的两个问题，是由于在设计MySQL的时候在性能和功能之间权衡的结果，对于ID不单调问题确实会造成实际开发中的BUG，但是这是可以由开发者规范数据库设计和代码来解决的，最新的MySQL8.0也已经解决了这个问题。而对于不连续的问题，数据库牺牲了ID的连续性，但是带来了数据库对并发写入的支持，大大的提高了写入数据的效率，也许这也是一个不错的交换。

在编程中这样的交换有很多，最典型的就是在算法中的时间和空间的交换，有开发者根据实际的情况出发，选择合理的方案解决问题。



