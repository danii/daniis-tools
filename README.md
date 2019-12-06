Danii's Tools
=============
Danii's Tools is a set of functions, types, better typings and extra methods to help improve your coding experience. Feel free to take whatever you like and leave the rest.

Usage
-----
Simply import the file that corresponds to your environments module manager and enjoy extended prototypes and types in TypeScript.

```TypeScript
import "./tools";

let numberNames: Of<number> = {"one": 1, "two": 2, "three": 3};
```
```JavaScript
require("./tools");

let strings = {
  "en": "You have ${count} new messages.",
  "cn": "您有${count}条新消息。"
}

alert(strings.en.interpolate({"count": 5}));
```

### Modifications
This project is licensed under the GNU General Public License v3.0, meaning you can modify it as much as you'd like, as long as you state your changes and keep a copy of the license public. So if you don't want / can't have object's prototype's to be extended, then you can edit them into functions or take them out and use them as you wish.
