//=================REGISTER A NEW USER=================
//POST: /api/users/register
//Unprotected

const registerUser = (req, res, next) => {
    res.json('User registration is working');
}

//=================Login a Registered User=================
//POST: /api/users/login
//Unprotected

const loginUser = (req, res, next) => {
    res.json('Login is working');
}

//=================User Profile=================
//POST: /api/users/:id
//Unprotected

const getUser = (req, res, next) => {
    res.json('User profile is working');
}

//=================Change User Avatar (Profile Picture)=================
//POST: /api/users/change-avatar
//protected

const changeAvatar = (req, res, next) => {
    res.json('Change avatar is working');
}

//=================Edit User Details (from profile)=================
//POST: /api/users/edit-user
//protected

const editUser = (req, res, next) => {
    res.json('Edit user is working');
}

//=================Get Authors=================
//POST: /api/users/authors
//protected

const getAuthors = (req, res, next) => {
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