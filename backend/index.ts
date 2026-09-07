import express, {Request, Response} from "express";
import cors from 'cors'

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors())
app.use(express.urlencoded({extended : true }))

app.get("/", async(req: Request, res: Response) => {

    return res.json({message : `first request ;)`})

})

app.listen(PORT, () =>{

    console.log(`The server is up and running at port ${PORT}`)

})