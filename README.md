microblog
=========

nodejs guide microblog

nodejs guide 里面的一个例子，如下运行即可。

```
npm install
node app
```

因为书里使用的是express 2.x，而做的时候使用的3.x，部分差异如下：

1. 书里使用`express -t ejs microblog`快速建立网站目录结构，在3.x里-t参数已经无效，可以使用新的参数-e表示使用ejs模板引擎，即：`express -e microblog`，当然你也可以手动的去修改app.js里的内容；
2. 生成的app.js部分与书上的不一致，如app.configure,express.bodyParser()等，这个无妨；
3. 3.x默认不再使用layout.ejs，可以使用`<%- include header.ejs %>`，这种方式更灵活；
4. connect-mongo的用法改变，你需要这样使用`var MongoStore = require('connect-mongo')(express);`
5. 3.x默认不支持flash，你需要手动安装connect-flash(安装方法同connect-mongo)，并在app.js中添加：

  ```
  var flash = require('connect-flash');
  ...
  app.use(flash());
  ```
6. 3.x默认不支ejs模块的partials方法，你需要使用express-partials，并在app.js中添加：

  ```
  var partials = require('express-partials');
  ...
  app.use(partials());
  ```
7. dynamicHelpers的使用发生变化，改用中间件+res.locals的方式

  2.x：
  
    ```
    app.dynamicHelpers({
    	user: function(req, res){
    		return req.session.user;
    	},
    	error: function(req, res){
    		var err = req.flash('error');
    		return err.length ? err : null;
    	},
    	success: function(req, res){
    		var succ = req.flash('success');
    		return succ.length ? succ : null
    	}
    })
    ```
  3.x可以这样：

    ```
    app.use(function(req, res, next){
    	res.locals.error = req.flash('error').toString();
    	res.locals.success = req.flash('success').toString();
    	res.locals.user = req.session ? req.session.user : null;
    	next();
    })
    ```

本例中涉及到的主要就这些吧，比较详细的差异可以在这里查看：

https://github.com/visionmedia/express/wiki/Migrating-from-2.x-to-3.x

另外源码中同时用jade实现了一遍，只需修改`app.set('view engine', 'jade');`参数即可切换。由于初学，个人感觉ejs确实要比jade好理解一些，并且jade写起来真心痛苦，可能我打开方式不对吧。
