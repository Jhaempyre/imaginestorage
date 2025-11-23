here is a snipped to see the flow of aes-256-gcm encryption implementation:

1. key generation:

```ts
const crypto = require("crypto");
crypto.randomBytes(32).toString("hex");
```

2. encryption:

```js
const crypto = require("crypto");
const masterKey = "4377ea2fb77959d9ed332e8996595d405d974041997718af924a8807e29cd821"; // Example master key (32 bytes for AES-256)

const object = {
  accessKey: "sampleAccessKey",
  secretKey: "sampleSecretKey",
};

const plaintext = JSON.stringify(object);

// Generate random IV (12 bytes is standard for GCM)
const iv = crypto.randomBytes(12);

const masterKeyBuffer = Buffer.from(masterKey, "hex");

// Create cipher
const cipher = crypto.createCipheriv("aes-256-gcm", masterKeyBuffer, iv);

// Encrypt the data
let encrypted = cipher.update(plaintext, "utf8", "hex");
encrypted += cipher.final("hex");

// Get the auth tag
const authTag = cipher.getAuthTag();

// Combine all parts into a single string (easier for MongoDB storage)
const encryptedData = {
  iv: iv.toString("hex"),
  authTag: authTag.toString("hex"),
  encrypted: encrypted,
};

console.log("data:", JSON.stringify(object), "encryptedData:", JSON.stringify(encryptedData));
```

decription:

```ts
const crypto = require("crypto");

const encryptedString =
  '{"iv":"3e31bc329171dd992f1bd6a8","authTag":"caef06465588af209e04098bc9aaa982","encrypted":"8ceda50aa625878e4afa3abdc18d28d7e01ac069431976bc3548c89bf49618d8ca42e78dbc80fd5905da4a27b7d27216a8a5c2a04dd3670bdc13a98a00"}';

const masterKey = "4377ea2fb77959d9ed332e8996595d405d974041997718af924a8807e29cd821"; // Example master key (32 bytes for AES-256)

const encryptedData = JSON.parse(encryptedString);

// Convert hex strings back to buffers
const iv = Buffer.from(encryptedData.iv, "hex");
const authTag = Buffer.from(encryptedData.authTag, "hex");

const masterKeyBuffer = Buffer.from(masterKey, "hex");

// Create decipher
const decipher = crypto.createDecipheriv("aes-256-gcm", masterKeyBuffer, iv);
decipher.setAuthTag(authTag);

// Decrypt the data
let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
decrypted += decipher.final("utf8");

console.log("Decrypted string:", decrypted);
```
