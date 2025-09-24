function createPost(req, res, next){
    const {title, content} = req.body;
    if(!title || !content) {
        return res.status(400).send('All fields are required');
    }
    next();
}

module.exports = {createPost};
