

// =================CREATE A POST===========
// POST : api/posts
//Unprotected
const createPost = async (req, res, next) => {
    res.json("Create Post");
}

// =================GET SINGLE POST===========
// GET : api/posts/:id
//Unprotected
const getPost = async (req, res, next) => {
    res.json("Get single Post");
}

//===================GET ALL POSTS==================
// GET : api/posts
//Unprotected
const getPosts = async (req, res, next) => {
    res.json("Get all Posts");
}


// =================GET POST BY CATEGORY===========
// GET : api/posts/categories/:category
//Unprotected
const getCatPosts = async (req, res, next) => {
    res.json("Get Posts By Category");
}

// =================GET AUTHOR POST===========
// GET : api/posts/users/:id
//Unprotected
const getUserPosts = async (req, res, next) => {
    res.json("Get user Posts");
}

// =================EDIT POSTt===========
// PATCH : api/posts/:id
//Protected
const editPost = async (req, res, next) => {
    res.json("Edit Post");
}

// =================DELETE POST===========
// DELETE : api/posts/:id
//Protected
const deletePost = async (req, res, next) => {
    res.json("Delete Post");
}

module.exports = {
    getPost,
    getPosts,
    createPost,
    getCatPosts,
    getUserPosts,
    editPost,
    deletePost
};