var v1 = 'v1';
// 10000 code
v1 = 'looksun';
var v2 = 'v2';

var o = {
    v1: 'v1',   // 객체에 있는 값 하나하나를 프로포티라고 부르다. (앞에있는 v1, v1 : 'v1' 에서 왼쪽에 있는 거)
    v2: 'v2',
    f1: function () {
        console.log(this.v1);   // 함수가 속해있는 개체를 참조할 수 있게 만듦
    },
    f2: function () {
        console.log(this.v2);
    },
}

o.f1();
o.f2();