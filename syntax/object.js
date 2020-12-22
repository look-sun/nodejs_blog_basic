var members = ['looksun', 'hello', 'world'];
console.log(members[0]);

var roles = {
    'programmer': 'looksun',
    'designer': 'hello',
    'manager': 'world',
}
console.log(roles.designer);

var i = 0;
while(i < members.length){
    console.log("array loop ", members[i]);
    ++i;
}

for(var name in roles){
    console.log('object', name, 'value ', roles[name]);
}