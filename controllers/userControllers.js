const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const HttpError = require('../models/errorModel');
const fs = require('fs');
const path = require('path');
const {v4: uuidv4} = require('uuid');




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
        res.status(201).json(`New user: ${newUser.email} registered successfully.`);



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
    try{
        const {email, password} = req.body;
        if(!email || !password) {
            return next(new HttpError('Fill in all required fields.', 422));
        }

        const newEmail = email.toLowerCase();

        const user = await User.findOne({email: newEmail});
        if(!user) {
            return next(new HttpError('Invalid credentials, could not log you in.', 422));
        }

        const comparePasswords = await bcrypt.compare(password, user.password);
        if(!comparePasswords) {
            return next(new HttpError('Invalid credentials, could not log you in.', 422));
        }

        const {_id: id, name} = user;
        // Use a secret key and optionally set token expiration
        const token = jwt.sign({id, name}, process.env.JWT_SECRET, {expiresIn: '1d'});

        res.status(200).json({token, id, name});

    }catch(error){
        return next(new HttpError('Logging in user failed, please try again later.', 422));
}
}





//=================User Profile=================
//POST: /api/users/:id
//Unprotected

const getUser = async (req, res, next) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id).select('-password');   
        if(!user) {
            return next(new HttpError('User not found.', 404));
        }
        res.status(200).json(user);
    } catch (error) {
        return next(new HttpError('Fetching user failed, please try again later.', 422));
    }


}


//=================Change User Avatar (Profile Picture)=================
//POST: /api/users/change-avatar
//protected

const changeAvatar = async (req, res, next) => {
    try {
        // Validate uploaded file presence (express-fileupload attaches files to req.files)
        if (!req.files || !req.files.avatar) {
            return next(new HttpError('No avatar file uploaded.', 422));
        }

        // Find user from database
        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new HttpError('User not found.', 404));
        }

        // Delete previous avatar file from uploads folder (if present)
        if (user.avatar) {
            fs.unlink(path.join(__dirname, '..', 'uploads', user.avatar), (err) => {
                if (err) {
                    return next(new HttpError('Deleting previous avatar failed.', 422));
                }
            });
        }

        // Incoming file
        const avatar = req.files.avatar;

        // Check file size (limit 3MB)
        if (avatar.size > 3 * 1024 * 1024) {
            return next(new HttpError('Avatar file size exceeds 3MB limit.', 422));
        }

        const fileName = avatar.name;
        const splittedFileName = fileName.split('.');
        const newFileName = `${splittedFileName[0]}${uuidv4()}.${splittedFileName[splittedFileName.length - 1]}`;

        // Move file to uploads folder
        avatar.mv(path.join(__dirname, '..', 'uploads', newFileName), async (err) => {
            if (err) {
                return next(new HttpError('Uploading avatar failed.', 422));
            }

            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                { avatar: newFileName },
                { new: true }
            ).select('-password');
            if (!updatedUser) {
                return next(new HttpError('Avatar cant change.', 422));
            }
            res.status(200).json(updatedUser);
        });
    } catch (error) {
        return next(new HttpError('Changing avatar failed, please try again later.', 422));
    }
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
    try {
        const authors = await User.find().select('-password');
        res.status(200).json(authors);
    } catch (error) {
        return next(new HttpError('Fetching authors failed, please try again later.', 422));
    }
    if(!authors) {
        return next(new HttpError('No authors found.', 404));
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUser,
    changeAvatar,
    editUser,
    getAuthors
}
