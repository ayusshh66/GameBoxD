import express, {Request, Response} from "express";
import cookieParse from "cookie-parser";
import cors from 'cors'
import authRouter from "./src/modules/auth/auth.routes"

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended : true }));
app.use(cookieParse());

app.get("/", async(req: Request, res: Response) => {

    return res.json({message : `first request ;)`})

})

app.use("/api/auth", authRouter)

app.listen(PORT, () =>{

    console.log(`The server is up and running at port ${PORT}`)

})