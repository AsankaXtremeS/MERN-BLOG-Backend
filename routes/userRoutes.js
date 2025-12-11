const {Router} = require('express');

const router = Router();

router.get('/', (req, res,next) => {
    res.send('User route is working');
});

module.exports = router;