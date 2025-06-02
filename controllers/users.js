const User = require('../models/user');

module.exports.getRegister = (req,res) => {
    res.render('users/register')
}
module.exports.getLogin = (req,res)=>{
    res.render('users/login')
}
module.exports.createUser = async(req,res,next)=>{
    try{
    const {email,username,password} = req.body;
    const user = new User({email,username});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser, err=>{
        if(err) return next(err);
            req.flash('success','welcome to YP');
            res.redirect('/restaurants');
    })
    }catch(err){
        req.flash('danger',err.message);
        res.redirect('/register')
    }
}
module.exports.userLogin = (req,res)=>{
    req.flash('success','welcome back');
    const redirectUrl = res.locals.returnTo || '/restaurants';
    delete res.locals.returnTo;
    res.redirect(redirectUrl);
}
module.exports.userLogout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/restaurants');
    });
}