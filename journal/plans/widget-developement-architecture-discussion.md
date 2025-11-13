maine discuss kia gpt se:

hame mainly script wala hi banana hai, jo ek runtime code hoga, mai explain krta hu step by step:

---------------------------------------------------------------------------------------

Public key generation ke time par:

developer ye cheeze setup karega at the time of generating public key (basically jime ham api key keh rhe the):
Allowed Mime Types
Max File Size
Allowed folders
Rate limits
Allowed domains
Optional: Require captcha / human verification

ye ham db me store karenge aur jab bhi koi us public key se upload karega to ye sab cheeze check karenge.
ab ye sab cheeze ham sdk me bhi daalenge taki developer ko pata chale ki kya kya cheeze allowed hai.

---------------------------------------------------------------------------------------

Widget development setup:

1. core widget frameword agnostic hoga - vanilla js (no react) - we can use typescript tho
2. ye cdn se load hoga jo ham hi host karenge at cdn.imaginarystore.com/widget/v1/widget.js
3. script aesa kuch expose karege:
```js
window.YourWidget = {
  init(options) { … },
  open() { … },
  close() { … },
  on(eventName, callback) { … },
  destroy() { … }
}
```
4. core structure kuch aesa hoga:
```js
class WidgetCore {
  constructor(config) { … }
  async requestUploadToken() { … }
  async uploadFile(file) { … }
  on(event, cb) { … }
  emit(event, data) { … }
}
```
5. ui renderer kuch aesa hoga:
```js
class WidgetUI {
  constructor(core) { … }
  mount(el) { … }
  open() { … }
  close() { … }
}
```
6. widget ui ko hame shadow dom me render karna hoga taki css conflicts na ho, iframe me bhi kar sakte hai but vo complex hoga.
7. ab iske upar ham react ka warapper de skate hain jo npm se install hoga aur react me use karne ke liye easy banayega.
```tsx
import { useEffect, useRef } from "react";

export function StorageWidget({ publicKey, ...options }) {
  const ref = useRef(null);

  useEffect(() => {
    const widget = window.YourWidget.init({
      publicKey,
      mount: ref.current,
      ...options
    });

    return () => widget.destroy();
  }, []);

  return <div ref={ref} />;
}
```
8. final aesa kuch setup hoga core widget ka:
```bash
 /widget
   /src
     core/
       WidgetCore.js     (business logic)
       events.js         (pub/sub)
     ui/
       WidgetUI.js       (dom/iframe/shadow-dom)
       index.html        (iframe inner app)
     api/
       requestToken.js
       uploadFile.js
     entry/
       global.js         (window.YourWidget)
   /dist
     widget.js           (UMD/IIFE build)
```
```bash
 /npm-sdk
   index.js             (ESM)
   types.d.ts
   react/
     StorageWidget.jsx  (tiny wrapper)
```



