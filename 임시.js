app.get('/create_process', (request, response)=>{
  var body = '';
  request.on('data', (data)=>{
    body += data;

    // Too much POST data, kill the connection!
    // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
    if (body.length > 1e6)  // 너무 용량이 큰 글은 거부
      request.connection.destroy();
  });
  request.on('end', ()=>{
    var post = qs.parse(body);
    // console.log(post.title);
    // console.log(post.description);
    var title = post.title;
    var description = post.description;

    fs.writeFile(`data/${title}`, description, 'utf8', (err)=>{
      response.writeHead(302, {location: `/?id=${title}`});
      response.send();
    });
  });
});