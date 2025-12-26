const Post = require('../models/postModel');
const User = require("../models/userModel");
const path = require('path');
const fs = require('fs');
const {v4: uuidv4} = require('uuid');
const HttpError = require('../models/errorModel');


// =================CREATE A POST===========
// POST : api/posts
//Unprotected
const createPost = async (req, res, next) => {
    try {
        let {title, category, description} = req.body;
        if(!title || !category || !description) {
            return next(new HttpError('Please fill in all required fields.', 422));
        }
        const {thumbnail} = req.files;
        if(thumbnail.size > 2000000){
            return next(new HttpError('Image size should be less than 2MB.', 422));
        }

        let fileName = thumbnail.name;
        let splittedFileName = fileName.split('.');
        let newFilename = splittedFileName[0] + uuidv4() + '.' + splittedFileName[splittedFileName.length - 1];

        thumbnail.mv(path.join(__dirname, '../', 'uploads', newFilename), async (err) => {
            if(err){
                return next(new HttpError('Uploading thumbnail failed, please try again.', 500));
            }else{
                const newPost = await Post.create({title, category,description,thumbnail: newFilename,creator: req.user.id})
                if(!newPost) {
                return next(new HttpError("Post couldn't be created.", 422))
                }

                // find user and increase post count by 1
                const currentUser = await User.findById(req.user.id);
                const userPostCount = currentUser.posts + 1;
                await User. findByIdAndUpdate(req.user.id, {posts: userPostCount})

                res.status(201).json(newPost)
            }
        });
           
    } catch (error) {
       return next(new HttpError('Creating post failed, please try again later.', 500)); 
    }
}

// =================GET SINGLE POST===========
// GET : api/posts/:id
//Unprotected
const getPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const post =  await Post.findById(postId);
        if(!post) {
            return next(new HttpError('Post not found.', 404));
        }
        res.status(200).json(post);
    } catch (error) {
        return next(new HttpError('Fetching post failed, please try again later', 500));
    }
}


//===================GET ALL POSTS==================
// GET : api/posts
//Unprotected
const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({updatedAt: -1});
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError('Fetching posts failed, please try again later.', 500));
    }
}



// =================GET POST BY CATEGORY===========
// GET : api/posts/categories/:category
//Unprotected
const getCatPosts = async (req, res, next) => {
    try {
        const {category} = req.params;
        const catPosts = await Post.find({category}).sort({createdAt: -1});
        res.status(200).json(catPosts);
    } catch (error) {
        return next(new HttpError('Fetching posts failed, please try again later.', 500));
    }
}


// =================GET AUTHOR POST===========
// GET : api/posts/users/:id
//Unprotected
const getUserPosts = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const userPosts = await Post.find({creator: userId}).sort({createdAt: -1});
        res.status(200).json(userPosts);
    } catch (error) {
        return next(new HttpError('Fetching user posts failed, please try again later.', 500));
    }
}



// =================EDIT POSTt===========
// PATCH : api/posts/:id
//Protected
const editPost = async (req, res, next) => {
   try {
      let fileName;
      let newFilename;
      let updatedPost;
      const postId = req.params.id;

      let { title, category, description } = req.body;

      // Correct validation
      if (!title || !category || !description || description.length < 12) {
          return next(new HttpError('Please fill in all required fields.', 422));
      }

            // get old post from DB
            const oldPost = await Post.findById(postId);
            if (!oldPost) {
                return next(new HttpError('Post not found.', 404));
            }
            // Only creator can edit
            if (String(req.user.id) !== String(oldPost.creator)) {
                return next(new HttpError('Not authorized to edit this post.', 403));
            }

            // If no new file is uploaded, just update text fields
            if (!req.files || !req.files.thumbnail) {
                updatedPost = await Post.findByIdAndUpdate(
                    postId,
                    { title, category, description },
                    { new: true }
                );
            } else {
                // delete old thumbnail from uploads folder
                fs.unlink(
                    path.join(__dirname, "..", "uploads", oldPost.thumbnail),
                    (err) => {
                        if (err) {
                            // Log error but don't block the update
                            console.error("Failed to delete old thumbnail:", err);
                        }
                    }
                );
                const { thumbnail } = req.files;

                if (thumbnail.size > 2000000) {
                    return next(
                        new HttpError("Image size should be less than 2MB.", 422)
                    );
                }

                fileName = thumbnail.name;
                const splittedFileName = fileName.split(".");
                newFilename =
                    splittedFileName[0] +
                    uuidv4() +
                    "." +
                    splittedFileName[splittedFileName.length - 1];
                // move new thumbnail to uploads folder
                await thumbnail.mv(
                    path.join(__dirname, "..", "uploads", newFilename)
                );
                updatedPost = await Post.findByIdAndUpdate(
                    postId,
                    { title, category, description, thumbnail: newFilename },
                    { new: true }
                );
            }
      if (!updatedPost) {
        return next(new HttpError("Post couldn't be updated.", 422));
      }
      res.status(200).json(updatedPost);
   } catch (error) {
     return next(
       new HttpError("Editing post failed, please try again later.", 500)
     );
   }
}

// =================DELETE POST===========
// DELETE : api/posts/:id
//Protected
const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return next(new HttpError('Post not found.', 404));
        }
        // Check if the deleter is the post creator
        if (String(req.user.id) !== String(post.creator)) {
            return next(new HttpError('Not authorized to delete this post.', 403));
        }
        const fileName = post.thumbnail;
        // Delete thumbnail from uploads folder
        fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
            if (err) {
                return next(new HttpError('Deleting thumbnail failed.', 422));
            } else {
                await Post.findByIdAndDelete(postId);
                // find user and decrease post count by 1
                const currentUser = await User.findById(req.user.id);
                const userPostCount = currentUser.posts - 1;
                await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
                res.status(200).json(`${postId} deleted successfully.`);
            }
        });
    } catch (error) {
        return next(new HttpError('Deleting post failed, please try again later.', 500));
    }
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