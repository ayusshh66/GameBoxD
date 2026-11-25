import express, {Request, Response,NextFunction} from "express";
import cookieParse from "cookie-parser";
import cors from 'cors'
import socialRoutes from "./src/modules/social/social.routes";
import authRouter from "./src/modules/auth/auth.routes"
import gameRouter from "./src/modules/games/games.routes"
import homeDiscoveryRoutes from "./src/modules/games/home-discovery.routes";
import feedRoutes from "./src/modules/feed/feed.routes";
import reviewRepliesRoutes from "./src/modules/review-replies/review-replies.routes";
import genreRouter from "./src/modules/genres/genres.routes";
import tagsRouter from "./src/modules/tags/tags.routes";
import platformRouter from "./src/modules/platforms/platforms.routes";
import followsRoutes from "./src/modules/follows/follows.routes";
import reviewsRoutes from "./src/modules/reviews/reviews.routes";
import libraryRoutes from "./src/modules/library/library.routes";
import usersRoutes from "./src/modules/users/users.routes";
import reviewLikesRoutes from "./src/modules/review-likes/review-likes.routes";
import catalogRoutes from "./src/modules/games/catalog.routes";
import gamePageRoutes from "./src/modules/games/game-page.routes";


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
app.use("/api/games", catalogRoutes);
app.use("/api/games", gamePageRoutes);
app.use("/api/games", gameRouter);
app.use("/api/tags",tagsRouter)
app.use("/api/platforms",platformRouter)
app.use("/api", reviewsRoutes);
app.use("/api", libraryRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/users", followsRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/reviews", reviewLikesRoutes);
// Specific discovery routes FIRST
app.use("/api/discovery", homeDiscoveryRoutes);
// General games routes SECOND
app.use("/api/games", gameRouter);
app.use("/api/social", socialRoutes);
app.use("/api/reviews", reviewRepliesRoutes);
app.listen(PORT, () =>{

    console.log(`The server is up and running at port ${PORT}`)

})

app.use(
  (
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error("API error:", req.method, req.path);
    console.error(err);

    if (err instanceof Error && "cause" in err) {
      console.error("DATABASE CAUSE:", err.cause);
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);
