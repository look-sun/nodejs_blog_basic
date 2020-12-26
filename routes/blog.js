const express = require('express');
const router = express.Router();
const sanitizeHtml = require('sanitize-html');
const templates = require('../lib/templates.js');
const path = require('path');
const fs = require('fs');

router.get('/page/:pageId', (req, res, next)=>{
  var filterdId = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filterdId}`, 'utf8', (err, description)=>{
    if(err){
      next(err);
    }
    else{
      var list = templates.list(req.list);
      var title = req.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description, ()=>{
        allowedTags: ['h1', 'h2']
      });
       var body = `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`;
       var control = `
         <a href="/blog/create">create</a>
         <a href="/blog/update/${sanitizedTitle}">update</a>
         <form action="/blog/delete_process" method="POST">
           <input type="hidden" name="id" value="${sanitizedTitle}">
           <input type="submit" value"삭제">
         </form>`;
       var template = templates.html(sanitizedTitle, list, body, control);
  
       res.send(template);
    }
  });
});
  
router.get('/create', (req, res)=>{
  var title = 'WEB - create';
  var body = `
  <form action="/create_process" method="POST">
    <p><input name="title" type="text" placeholder="title"></p>
    <p><textarea name="description" placeholder="description"></textarea></p>
    <p><input type="submit"></p>
  </form>
  `;
  var list = templates.list(req.list);
  var control = '';
  var template = templates.html(title, list, body, control);

  res.send(template);
});
  
router.post('/create_process', (req, res)=>{  // post 정보를 받을 때에는 app.get 이 아니라 post로 받아야 한다.
  // Too much POST data, kill the connection!
  // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
  if (req.body.length > 1e6)  // 너무 용량이 큰 글은 거부
    req.connection.destroy();
    
  var post = req.body;
    // console.log(post.title);
    // console.log(post.description);
    var title = post.title;
    var description = post.description;
  
    fs.writeFile(`data/${title}`, description, 'utf8', (err)=>{
      res.redirect(`/blog/page/${title}`);
    });
});
  
router.get('/update/:pageId', (req, res)=>{
  var filterdId = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filterdId}`, 'utf8', (error, description)=>{
    var list = templates.list(req.list);
    var title = req.params.pageId;
    var body = `
    <form action="/update_process" method="POST">
      <input name="id" type="hidden" value="${title}">
      <p><input name="title" type="text" placeholder="title" value="${title}"></p>
      <p><textarea name="description" placeholder="description">${description}</textarea></p>
      <p><input type="submit"></p>
    </form>
    `;
    var control = `<a href="/blog/create">create</a>`;
    var template = templates.html(title, list, body, control);
  
    res.send(template);
  });
}); 
  
router.post('/update_process', (req, res)=>{
  // Too much POST data, kill the connection!
  // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
  if (req.body.length > 1e6)  // 너무 용량이 큰 글은 거부
    req.connection.destroy();
  
  var post = req.body;
  // console.log(post.title);
  // console.log(post.description);
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, (err)=>{
    fs.writeFile(`data/${title}`, description, 'utf8', (error)=>{
      res.redirect(`/blog/page/${title}`);
    });
  });
  console.log(post);
});
  
router.post('/delete_process', (req, res)=>{
  var post = req.body;
  // console.log(post.title);
  // console.log(post.description);
  // var id = post.id;
  var filterdId = path.parse(post.id).base;
    fs.unlink(`data/${filterdId}`, (err)=>{
    res.redirect('/');
  });
  console.log(post);
});

module.exports = router;