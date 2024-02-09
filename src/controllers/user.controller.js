import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'



const registerUser = asyncHandler( async (req,res) => {



    // ------> get user details from frontend   

    const {fullName , email , username , password } = req.body 
    console.log("req.body -> ",req.body);
    console.log("email : ", email);




    // ------> validation - not empty

    /* One way is to appply if statement on all the fields like this
    
                // if(fullName === ""){
                //     throw new ApiError(400 , "Full name is required")
                // }
    */
    
    if(
        [fullName , email , username , password].some(
            (field)=>field?.trim() === "")
    ) {
        throw new ApiError(400 , " All fields are required ")
    }




    // -----> check if teh user already exists : username and email both


    // this is the other way of validation/checking using 
    // (.some()) javascript method 
    // to use this across all fields at one time only


    
    const existedUser = await User.findOne({
        $or: [ { username },{ email } ]
    })

    if(existedUser){
        throw new ApiError(409," User with email or username already exists ")
    }


    
    // -------> check for images , check for avatar

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log("req.files -> ",req.files);


    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
     let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
         coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400," Avatar file is required ")
    }




    // ---------> upload them to cloudinary ,check avatar again

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    console.log("avatar -:  " , avatar);

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log("cover image -:  ",coverImage);

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
    console.log("created user -: ",createdUser);

    // ----------------> check for user creation
    
    if(!createdUser){
        throw new ApiError(
            500, 
            " Something went wrong while registering the user")
    }


    // ----------> return response

    return res.status(201).json(
        new ApiResponse(200 , createdUser , " User registered Successfully ")
    )


})


const loginUser  = asyncHandler ( async(req,res) =>{
     
    // TODO for login user 

    // -----> get data from req.body 

    const { email , username , password } = req.body;
    console.log(email);

    // ------> check if username or email is present or not in order to login

    if(!(username || email)){
        throw new ApiError(400," username or email is required")
    }


    // ------>  find the user in database 

    const user = await User.findOne({
        $or: [{ username } , { email }]
    })

    if(!user){
        throw new ApiError(404," User does not exist ")
    }


    // ------->  if user present check and compare passwords

    /* NOTE -: here is a small note about the user instances in the code i.e. (user and User) and what and which to use with whom.

    ------->>> the " user " intance is a method created by us to handle and use all the data coming from the
                database into the code, it does not have any access to the database methods like
                findOne(), create(), delete() methods use by the database . 
                It has access to methods like generateToken() , comparePassword() methods which are used to handle data coming from the database

    -------->>> the "User" instance is a method created by us to handle all the changes in the data to the database . 
                It has access to functions like findOne(), create() etc etc to make and modify the data into the databases according to our needs.
                It does not have access to methods which are used to manipulate and modify data like generateToken() , comparePasswords() .

     */
    
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, " Invalid User Credentials")
    }


    // -------> if passwords present give the user his access and refresh tokens

    const generateAccessAndRefreshTokens = async(userId) => {
        try {
            const user = await User.findById(userId)
            const accessToken = user.generateAccessToken()
            const refreshToken = user.generateRefreshToken()
            user.refreshToken = refreshToken
            await user.save({ validateBeforeSave: false })
    
            return {accessToken,refreshToken}
    
        } catch (error) {
            throw new ApiError(500 , "Something went wrong while generating refresh and access token")
        }
    } 

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")



    // --------->  send these tokens using secure cookie
    // ----------> send the response for login

    // by default the cookies are modifyable on the frontend tooo
    const options = {
        httpOnly: true,
        secure: true  
    } // after doing this the cookies are available to everyone but 
      // cannot be modified anywhere except by the server .


    return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    user: " Logged in User",
                    accessToken,
                    refreshToken,
                },
                "User Logged in Successfully"
            )
        )
})


const logoutUser = asyncHandler( async( req,res )=> {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"))

    
})

export {
    registerUser,
    loginUser,
    logoutUser,
}