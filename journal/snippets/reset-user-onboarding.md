```js
let user = db.users.findOne({email: "avinash2002a@gmail.com"});
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