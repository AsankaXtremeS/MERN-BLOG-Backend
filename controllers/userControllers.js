const bcrypt = require('bcryptjs');

const User = require('../models/userModel');
const HttpError = require('../models/errorModel');




//=================REGISTER A NEW USER=================
//POST: /api/users/register
//Unprotected

const registerUser = async (req, res, next) => {
    try {
        const {name, email, password, password2} = req.body;
        if(!name || !email || !password) {
            return next(new HttpError('Please fill in all required fields.', 422));
        }

        const newEmail = email.toLowerCase();
        const emailExists = await User.findOne({email: newEmail});
        if(emailExists) {
            return next(new HttpError('Email already in use, please use a different email.', 422));
        }

        if((password.trim()).length < 6) {
            return next(new HttpError('Password must be at least 6 characters long.', 422));
        }

        if(password !== password2) {
            return next(new HttpError('Passwords do not match.', 422));
        }

        const salt =  await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email: newEmail,
            password: hashedPassword
        })
        res.status(201).json(newUser);



        await newUser.save();
        res.status(201).json({message: 'User registered successfully'});

    } catch (error) {
        return next(new HttpError('Registering user failed, please try again later.', 422));
    }
}








//=================Login a Registered User=================
//POST: /api/users/login
//Unprotected

const loginUser = async (req, res, next) => {
    res.json('Login is working');
}

//=================User Profile=================
//POST: /api/users/:id
//Unprotected

const getUser = async (req, res, next) => {
    res.json('User profile is working');
}

//=================Change User Avatar (Profile Picture)=================
//POST: /api/users/change-avatar
//protected

const changeAvatar = async (req, res, next) => {
    res.json('Change avatar is working');
}

//=================Edit User Details (from profile)=================
//POST: /api/users/edit-user
//protected

const editUser = async (req, res, next) => {
    res.json('Edit user is working');
}

//=================Get Authors=================
//POST: /api/users/authors
//protected

const getAuthors = async (req, res, next) => {
    res.json('All users/authors');
}

module.exports = {
    registerUser,
    loginUser,
    getUser,
    changeAvatar,
    editUser,
    getAuthors
}