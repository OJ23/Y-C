const User = require('../models/user');

module.exports.getRegister = async (req,res) => {
    const isBootstrapAdmin = await User.countDocuments({}) === 0;
    res.render('users/register', { isBootstrapAdmin })
}
module.exports.getLogin = (req,res)=>{
    res.render('users/login')
}
module.exports.createUser = async(req,res,next)=>{
    try{
    const {email,username,password} = req.body;
    // After an account reset, the first person to register becomes the
    // super admin. Later registrations remain ordinary users.
    const isFirstUser = await User.countDocuments({}) === 0;
    const user = new User({
        email,
        username,
        role: isFirstUser ? 'superAdmin' : 'user'
    });
    const registeredUser = await User.register(user,password);
    req.login(registeredUser, err=>{
        if(err) return next(err);
            req.flash('success', isFirstUser
                ? 'Welcome! Your super admin account has been created.'
                : 'Welcome to YP');
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
