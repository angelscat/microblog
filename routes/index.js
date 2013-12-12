var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');


exports.index = function(req, res){
	Post.get(null, function(err, posts){
		if(err){
			req.flash('error', err);
			return res.redirect('/');
		}

		res.render('index', {
			title: '首页 - MicroBlog',
			posts: posts
		});
	})
};


// exports.hello = function(req, res){
// 	res.send('The time is ' + new Date().toString());
// }

exports.user = function(req, res){
	User.get(req.params.user,function(err, user){
		if(!user){
			req.flash('error', '用户不存在');
			return res.redirect('/');
		}
		Post.get(user.name, function(err, posts){
			if(err){
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('user',{
				title: user.name + ' - MicroBlog',
				username: user.name,
				posts: posts
			})
		})
	})
}

exports.post = function(req, res){
	var currentUser = req.session.user;
	var post = new Post(currentUser.name, req.body.post);
	post.save(function(err){
		if(err){
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发表成功');
		res.redirect('/u/' + currentUser.name);
		// res.redirect('/')
	})
}

exports.reg = function(req, res){
	res.render('reg',{title: '用户注册 - MicroBlog'})
}

exports.doReg = function(req, res){
	//检验用户两次输入的密码是否一致
	if(req.body['password-repeat'] != req.body['password']){
		req.flash('error', '两次输入的口令不一致');
		return res.redirect('/reg');
	}

	//生成口令散列值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var newUser = new User({
		name: req.body.username,
		password:password
	});

	//检查用户是否已经存在
	User.get(newUser.name, function(err, user){
		if(user){
			err = '该用户已存在';
		}
		if(err){
			req.flash('error', err);
			return res.redirect('/reg');
		}

		newUser.save(function(err){
			if(err){
				req.flash('error', err);
				return res.redirect('/reg');
			}
			req.session.user = newUser;
			req.flash('success', '注册成功');
			res.redirect('/');
		})
	})
}

exports.login = function(req, res){
	res.render('login',{title: '用户登录 - MicroBlog'})
}

exports.doLogin = function(req, res){
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	User.get(req.body.username, function(err, user){
		if(!user){
			req.flash('error', '用户不存在');
			return res.redirect('/login');
		}
		if(user.password != password){
			req.flash('error', '密码错误');
			return res.redirect('/login');
		}
		req.session.user = user;
		//req.flash('success', '登录成功');
		res.redirect('/')
	})
}

exports.logout = function(req, res){
	req.session.user = null;
	//req.flash('success', '退出成功');
	res.redirect('/');
}

exports.checkLogin = function(req, res, next){
	if(!req.session.user){
		req.flash('error', '未登录')
		return res.redirect('/login');
	}
	next();
}

exports.checkNotLogin = function(req, res, next){
	if(req.session.user){
		//req.flash('error', '以登录');
		return res.redirect('/');
	}
	next();
}