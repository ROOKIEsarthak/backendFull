import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

import { verifyJWT } from "../middlewares/auth.middelware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },

        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser
    );


/* 

while using login route it is better to use POST method rather than GET method
because 
1-: data sent in post is sent in the body and hence is more secured than
data being sent in GET method where the data occurs in the URL 

2-: POST methods have no restrictions on length

3-: POST methods are not cached which means sensitive information is not 
stored in browser history

*/
router.route("/login").post(loginUser) 


// ------>  SECURED ROUTES

router.route("/logout").post(verifyJWT,logoutUser)



export default router;