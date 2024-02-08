import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const registerUser = asyncHandler( async (req,res) => {



    // ------> get user details from frontend   

    const {fullName , email , username , password } = req.body 
    console.log("email : ", email);

    // ------> validation - not empty

    /* One way is to appply if statement on all the fields like this
    
                // if(fullName === ""){
                //     throw new ApiError(400 , "Full name is required")
                // }
    */



    // -----> check if teh user already exists : username and email both


    // this is the other way of validation/checking using 
    // (.some()) javascript method 
    // to use this across all fields at one time only


    
    if(
        [fullName , email , username , password].some(
            (field)=>field?.trim() === "")
    ) {
        throw new ApiError(400 , " All fields are required ")
    }

    const existedUser = User.findOne({
        $or: [ { username },{ email } ]
    })
    console.log(existedUser);

    if(existedUser){
        throw new ApiError(409," User  with email or username already exists")
    }


    
    // -------> check for images , check for avatar

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(avatarLocalPath);
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    console.log(coverImageLocalPath);

    if(!avatarLocalPath){
        throw new ApiError(400," Avatar file is required ")
    }




    // ---------> upload them to cloudinary ,check avatar again

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400," Avatar file is required ")
    }


    // -------> create user object - create entry in a database (.create())

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || " ",
        email,
        password,
        username: username.toLowerCase()
    })



    // -------------> remove password and refresh token field from response 

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // ----------------> check for user creation
    
    if(!createdUser){
        throw new ApiError(
            500, 
            " Something went wrong while registering the user")
    }


    // ----------> return response

    return res.staus(201).json(
        new ApiResponse(200 , createdUser , " User registered Successfully ")
    )


})

export {
    registerUser,
}