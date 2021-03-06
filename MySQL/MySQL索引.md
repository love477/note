# MySQL索引

## 通用概念

索引：实现数据的快速查找。

### 常见的索引方式

#### 哈希索引

使用哈希算法（散列算法），将key通过哈希函数变换为固定长度的key地址。

存在的问题：地址冲突（数据碰撞）

解决办法：链地址法，用链表将碰撞的数据连接起来，查找数据时，检查数据是否有碰撞数据链表，若有，这一直遍历到链表尾部以获取真正的数据。

缺点：不适合做范围查询，如：

```sql
selec * from user where age > 18;
```

此时哈希索引的效率很低，没有办法做到高效的范围检索，所以不适合作为MySQL的底层索引。

#### 二叉查找树（BST）

BST：

1. **左**子树上所有结点的值均**小于或等于**它的根结点的值。

2. **右**子树上所有结点的值均**大于或等于**它的根结点的值。

3. 左、右子树也分别为二叉排序树。

有三种遍历二叉树的方法：中序、先序、后序。

先序遍历是指，对于树中的任意节点来说，先打印这个节点，然后在打印它的左子树，最后打印它的右子树。
中序遍历是指，对于树中的任意节点来说，先打印它的左子树，然后打印它自己，最后打印它的右子树。
后序遍历是指，对于树中的任意节点来说，先打印它的左子树，然后打印它的右子树，最后打印它自己。

BST常见的结构如下：

```
                4
             /     \
            2        6
          /  \      /  \
         1    3    5    7  
```

BST的检索效率也比较快：O(lgn)。但是BST不稳定，最差的情况下检索的效率会变成O(n)：

```
1
  \
    2
      \
        3
          \
            4
              \
                5
                  \
                    6
                      \
                        7
```

MySQL中主键默认的是递增的，所以BST不适合作为MySQL的底层索引。

### AVL树和红黑树

AVL树和红黑树是在BST的基础上衍生出来的，BST最大的问题就是其不平衡性，会极大的降低检索的效率，所以AVL树和红黑树基于节点的自动旋转和调整的方式，让BST始终保持平衡性。但是还是存在缺点：

- 红黑树并没有彻底解决BST不平衡问题，当数据量增加时，查找的性能也会明显的增加
- AVL树彻底解决了BST不平衡问题，但是没有解决磁盘IO的问题，AVL树、红黑树的叶子节点都只存储了一个数据，查询数据时，磁盘IO过多，而磁盘IO是数据库的性能瓶颈

### B树

1. 平衡二叉树节点最多有两个子树，而 B 树每个节点可以有多个子树，**M 阶 B 树表示该树每个节点最多有 M 个子树**
2. 平衡二叉树每个节点只有一个数据和两个指向孩子的指针，而 B 树每个**中间节点**有 k-1 个关键字（可以理解为数据）和 k 个子树（ **k 介于阶数 M 和 M/2 之间，M/2 向上取整）
3. B 树的所有叶子节点都在同一层，并且叶子节点只有关键字，指向孩子的指针为 null

B 树的节点数据大小也是按照左小右大，子树与节点的大小比较决定了子树指针所处位置。

B树的优势：**B 树的每个节点可以表示的信息更多，因此整个树更加“矮胖”，这在从磁盘中查找数据（先读取到内存、后查找）的过程中，可以减少磁盘 IO 的次数，从而提升查找速度。**

### B+树

B树的每个节点存放的是具体的数据，但是由于存储空间的限制，B树的节点存储不了太多的数据，此时，就有了B+树：

- B+树的节点存储的是数据的索引（地址），叶子节点存储所有数据
- B+树的叶子节点是数据阶段使用了一个链表串联前来，便于范围查找

所以，**B+树的高度比B树更低，更少的磁盘IO。其次，B+树的叶子节点是真正数据存储的地方，叶子节点用了链表连接起来，这个链表本身就是有序的，在数据范围查找时，更具备效率**。所以MySQL选择B+树作为实现索引的基本数据结构。

## 索引

非聚集索引：数据和索引分开，分别放到两个文件

聚集索引：数据和索引放在同一个文件

MySQL常见的数据引擎：InnoDB、MyISAM就分别使用了上面的两种索引，其中MyISAM使用的是非聚集索引，InnoDB使用的聚集索引。

### MyISANM

MyISAM中使用的是非聚集索引，所以MyISAM的数据有两个文件：一个数据文件（.MYD）、一个索引文件（.MYI）。MyISAM的主索引树（主键索引树）的叶子节点存放的是数据对应的物理地址，在查询的时候，先通过查找算法找到叶子节点，然后直接到数据文件中获取数据。当新增索引的时候，生成新的索引树，叶子节点也是存放的数据的物理地址，查询时也是通过叶子节点的地址直接获取数据。

可以看到，在MyISAM引擎的MySQL中，索引树并没有区别，但是在InnoDB中却不是这样的。

### InnoDB

InnoDB使用的是聚集索引的方式实现索引的，所以InnoDB的数据只有一个文件：.idb。

在建表的时候，InnoDB会根据主键ID建立主索引树（所以建表时需要指定主键），数的叶子结点存放主键ID对应的数据。当新增索引的时候，以索引列名为key建立索引树，这类索引树也叫辅助索引树。辅助索引树的叶子结点存放的不是对应的数据，而是对应数据的主键key，拿到这个key的时候，还需要在主索引树中查找一次才能找到对应的数据。

那为什么要这样设计呢？辅助索引树为什么直接存储数据呢？因为在实际的应用场景中，一张表的数据量都是非常大的，而且索引也会非常多，如果每一颗索引树都直接存储数据，那带来的存储开销是十分惊人的，所以在这里牺牲了一点查找的性能，节省了大量的存储空间。

***PS： MyISAM 直接找到物理地址后就可以直接定位到数据记录，但是 InnoDB 查询到叶子节点后，还需要再查询一次主键索引树，才可以定位到具体数据。等于 MyISAM 一步就查到了数据，但是 InnoDB 要两步，那当然 MyISAM 查询性能更高***









