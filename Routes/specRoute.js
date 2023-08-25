const express = require('express');
const spec_route = express();
const specController = require('../Controller/specController');

const multer = require("multer");
const upload = multer({ dest: '../client/public/SpecializationImages' });

const { adminverify } = require('../Middleware/adminMiddleware')


spec_route.get('/view',specController.loadSpec);
spec_route.post('/register',adminverify,specController.specRegister);
// spec_route.post('/register',adminverify, upload.single('image'),specController.specRegister);
spec_route.get('/admin-view',adminverify,specController.adminLoadSpec);
spec_route.put('/control-specialization/:specId',adminverify,specController.changeStatus);
spec_route.delete('/delete-specialization/:specId',adminverify,specController.deleteSpec);
// spec_route.post('/edit-spec',adminverify,upload.single('image'),specController.editSpec);
spec_route.post('/edit-spec',adminverify,specController.editSpec);



module.exports = spec_route;