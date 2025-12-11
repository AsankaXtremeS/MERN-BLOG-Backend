const {Router} = require('express');

const router = Router();

router.get('/', (req, res,next) => {
    res.send('Post route is working');
});

module.exports = router;