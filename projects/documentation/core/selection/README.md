
###选择元素
```javascript

d3.select('body');
d3.select('.content');
d3.select('#important');
d3.select(document.getElementById('important'));

d3.selectAll('.content');
d3.selectAll('p');

```

###选择集

####查看状态
```javascript

selection.empty(); //为空返回true,否则返回false

selection.node(); //返回第一个非空元素

selection.size(); //返回元素个数

```

####设定和获取属性

```javascript

selection.attr('name','jake'); //设置name属性
selection.attr('name',function(d,i){
	return 'jake';
}); // 设置name属性
selection.attr('name'); //获取name属性

selection.classed('red',true); // 开启red类
selection.classed('bigsize',false); //关闭bigsize类

selection.style('color','red');
selection.style({color:'red'});

selection.property('value','yuhualingfeng');//有部分属性不能用attr获取,最典型的就是文本输入框中的value属性.

selection.text('I love D3');

selction.html('This is <span>a</span> paragraph');



```

###添加 插入 删除

```javascript

selection.append(name)
selection.insert(name[,before])
selection.remove()


```

###数据绑定

```javascript

selection.datum([value])
selection.data(values[,key])


```

###选择集的处理

```javascript

selection.enter()  //用途为添加元素冰赋值初始属性
selection.exit() //用途为删除元素

select.filter(fn)

select.sort()

select.each()

select.call()

```

###数组的处理

```javascript

d3.ascending
d3.descending

d3.min(array[,accessor])   //返回最小值
d3.max(array[,accessor])   //返回最大值
d3.extend(array[,accessor])//返回最小值和最大值

d3.sum(array[,accessor]) //返回数组的总和
d3.mean(array[,accessor]) //返回数组的平均值

d3.median(array[,accessor]) //返回数组的中间值

d3.quantile(numbers,p) //求 p分位点的值


d3.variance(array[,accessor]) // 求方差

d3.deviation(array[,accessor]) // 求标准差


d3.bisectLeft() //获取某数组项左边的位置
d3.bisect() //获取某数组项右边的位置
d3.bisectRight() // 与bisect()一样

d3.shuffle(array[,lo[,hi]]) //随机排列数组

d3.merge(arrays) //合并两个数组

d3.pairs(array) // 返回邻接的数组对

d3.range([start,]stop[,step]) //返回等差数列

d3.permute(array,indexes) //根据指定的索引号数组返回排列后的数组

d3.zip(arrays...) //用多个数组来制作数组的数组

d3.transpose(matrix) //求转置矩阵

//映射(map)
d3.map([object][,key])
map.has(key)
map.get(key)
map.set(key,value)
map.remove(key)
map.keys()
map.values()
map.entries()
map.forEach()
map.empty()
map.size()

//集合(Set)
d3.set([array])
set.has(value)
set.add(value)
set.remove(value)
set.values()
set.forEach(function)
set.empty()
set.size()


//嵌套结构 (Nest)

d3.nest()
nest.key(function)
nest.entries(array)
nest.sortKeys(comparator)
nest.sortValues(comparator)
nest.rollup(function)
nest.map(array[,mapType])


```

##比例尺
```javascript

d3.scale.linear() 

linear(x)



```






