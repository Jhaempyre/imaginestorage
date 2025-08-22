import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app:Application = express();

//setting up the midddleware for cros 

app.use(cors({
     origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//for json parsing

app.use(express.json({
    limit: "10Mb"
}));

//yup for cookies
app.use(cookieParser());


//url encoding
app.use(express.urlencoded({
    extended: true,
    limit: "16Mb"
}));

//for stating where the files in public will stay
app.use(express.static("public"));

//here we will set routers and all (🎀)

export { app };