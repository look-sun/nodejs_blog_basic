const express = require('express');
const router = express.Router();
const templates = require('../lib/templates.js');

router.get('/', (req, res) => {
  var title = 'Hello!';
  var description = 'Welcome to in my web-site';
  var body = `
  <h2>${title}
  <img src="/images/idea.jpg" style="width:300px; display:block; margin-top:10px;">
  </h2>${description}
  `;
  //<span>Photo by <a href="https://unsplash.com/@jdiegoph?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Diego PH</a> on <a href="https://unsplash.com/s/photos/blog?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a></span>
  var list = templates.list(req.list);
  var control = `<a href="/blog/create">create</a>`;
  var template = templates.html(title, list, body, control);

  res.send(template);
});

module.exports = router;