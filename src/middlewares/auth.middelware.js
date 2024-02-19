import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler( async( req, _, next ) => {


    try {
        //console.log("cookies->",req.cookies);
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401," Unauthorized Request")    
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        //console.log("decodedToken -> ",decodedToken);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            
            throw new ApiError(401," Invalid Access Token ")
        }

        console.log("user ---->" , user);

        console.log("user before req.user = user  -----> ",req.user);

        req.user = user;

        console.log(" user after req.user = user -----> ",req.user );
        
        next()
    
    } catch (error) {
        throw new ApiError(401,error?.message || " Invalid access Token ")
    }
})