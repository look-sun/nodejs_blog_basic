const express = require('express')
const app = express()
const port = 80
const fs = require('fs');
const bodyParser = require('body-parser');
const compression = require('compression');
const blogRouter = require('./routes/blog');
const indexRouter = require('./routes/index')
const helmet = require('helmet');

app.use(helmet());
app.use(express.static('public'));  // public 디렉토리 안에서 파일을 찾겠다.
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
// app.use(bodyParse.json());
app.use(compression());  // 파일을 압축하는 미들웨어
app.get('*', (req, res, next)=>{  // use가 아닌 get으로 했기 때문에 app.get()으로 들어오는 요청에만 이것이 적용된다.
  fs.readdir('./data', (error, filelist)=>{
    req.list = filelist;
    next();
  });
});

app.use('/', indexRouter);

app.use('/blog', blogRouter);

app.use((req, res, next)=>{
  res.status(404).send('Sorry cont find that!');
});

app.use((err, req, res, next)=>{
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, ()=>{
  console.log(`Example app listening at http://localhost:${port}`)
});
/* 
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var templates = require('./lib/templates.js');
const { allowedNodeEnvironmentFlags } = require('process');

// 동작은 똑같지만 내부의 코드를 더 효율적으로 바꾸는 것을 refactoring(리팩토링) 이라고 한다.

var app = http.createServer(function(request, response) {
  
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    // console.log(pathname);

    if (pathname === '/') {  // root url 로 갔을 때
      if (queryData.id === undefined) {  // 만약 id 값이 없다면

        fs.readdir('./data', function(error, filelist) {  // 파일 읽어오기

          var title = 'Hello!';
          var description = 'Welcome to in my web-site';
          var body = `<h2>${title}</h2>${description}`;
          var list = templates.list(filelist);
          var control = `<a href="/create">create</a>`;
          var template = templates.html(title, list, body, control);

          response.writeHead(200);
          response.end(template);
        });
      }
      else{  // id 값이 있다면
        fs.readdir('./data', function(error, filelist){
          var filterdId = path.parse(queryData.id).base;
          fs.readFile(`data/${filterdId}`, 'utf8', function(err, description) {
            var list = templates.list(filelist);
            var title = queryData.id;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, function() {
              allowedTags: ['h1', 'h2']
            });
            var body = `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`;
            var control = `
              <a href="/create">create</a>
              <a href="/update?id=${sanitizedTitle}">update</a>
              <form action="/delete_process" method="POST">
                <input type="hidden" name="id" value="${sanitizedTitle}">
                <input type="submit" value"삭제">
              </form>`;
            var template = templates.html(sanitizedTitle, list, body, control);

            response.writeHead(200);
            response.end(template);
          });
        });
      }
    } 
    else if(pathname === '/create'){  // 글 작성
      fs.readdir('./data/', function(error, filelist) {

        var title = 'WEB - create';
        var body = `
        <form action="/create_process" method="POST">
          <p><input name="title" type="text" placeholder="title"></p>
          <p><textarea name="description" placeholder="description"></textarea></p>
          <p><input type="submit"></p>
        </form>

        `;
        var list = templates.list(filelist);
        var control = '';
        var template = templates.html(title, list, body, control);

        response.writeHead(200);
        response.end(template);
      });
    }
    else if(pathname === '/create_process') { // 글 작성이 완료되었을 때
      var body = '';
      request.on('data', function(data) {
        body += data;

        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6)  // 너무 용량이 큰 글은 거부
          request.connection.destroy();
      });
      request.on('end', function() {
        var post = qs.parse(body);
        // console.log(post.title);
        // console.log(post.description);
        var title = post.title;
        var description = post.description;

        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
          response.writeHead(302, {location: `/?id=${title}`});
          response.end();
        });
      });
      
    }
    else if (pathname === '/update') {  // update
      fs.readdir('./data/', function(error, filelist){
        var filterdId = path.parse(queryData.id).base;
        fs.readFile(`data/${filterdId}`, 'utf8', function(err, description) {
          var list = templates.list(filelist);
          var title = queryData.id;
          var body = `
          <form action="/update_process" method="POST">
            <input name="id" type="hidden" value="${title}">
            <p><input name="title" type="text" placeholder="title" value="${title}"></p>
            <p><textarea name="description" placeholder="description">${description}</textarea></p>
            <p><input type="submit"></p>
          </form>
          `;
          var control = `<a href="/create">create</a>`;
          var template = templates.html(title, list, body, control);

          response.writeHead(200);
          response.end(template);
        });
      }); 
    }
    else if (pathname === '/update_process') {  // update 받는 화면
      var body = '';
      request.on('data', function(data) {
        body += data;

        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6)  // 너무 용량이 큰 글은 거부
          request.connection.destroy();
      });
      request.on('end', function() {
        var post = qs.parse(body);
        // console.log(post.title);
        // console.log(post.description);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function(err) {
          fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
            response.writeHead(302, {location: `/?id=${title}`});
            response.end();
          });
        });
        console.log(post);
      });
    }
    else if (pathname === '/delete_process') {  // update 받는 화면
      var body = '';
      request.on('data', function(data) {
        body += data;

        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6)  // 너무 용량이 큰 글은 거부
          request.connection.destroy();
      });
      request.on('end', function() {
        var post = qs.parse(body);
        // console.log(post.title);
        // console.log(post.description);
        // var id = post.id;
        var filterdId = path.parse(post.id).base;
        fs.unlink(`data/${filterdId}`, function(err) {
          response.writeHead(302, {location: `/`});
          response.end();
        });
        console.log(post);
      });
    }
    else{ // 아무것도 없을 때
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(80);
*/