

const asyncHandler = (requestHandler) =>{
    (err,req,res,next)=>{
        Promise.resolve(requestHandler(err,req,res,next))
        .catch((err)=>next(err))
    }
}
export { asyncHandler }




/*This is a wrapper function which will be used further down in the code.
*/


// const asyncHandler = (fn) => {async(err,req,res,next) => {
//     try {
//         await fn(err,req,res,next)
        
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
        
//     }
// }} 


