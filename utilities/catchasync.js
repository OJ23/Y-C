module.exports = func => {
    console.log('4')
    return function (req,res,next) {
        func(req,res,next).catch(next)
        }
    }




// function wrapAsync(fn){
//     return function(req,res,next){
//         fn(req,res,next).catch(e=>next(e))
//     }
// }






