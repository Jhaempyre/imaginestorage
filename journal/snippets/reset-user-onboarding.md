```js
let user = db.users.findOne({email: "dmldome918@gmail.com"});
db.users.updateOne({_id: user._id}, {$set: {isOnboardingComplete: false}});
db.userstorageconfigs.updateOne(
  {userId: user._id},
  {$set: {
    encryptedCredentials: "__EMPTY__",
    credentials: {},
    isValidated: false
  }}
);
```