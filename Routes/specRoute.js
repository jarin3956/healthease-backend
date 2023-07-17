const express = require('express');
const spec_route = express();
const specController = require('../Controller/specController');

const multer = require("multer");
const upload = multer({ dest: '../healthease/public/SpecializationImages' });


spec_route.post('/register', upload.single('image'),specController.specRegister);
spec_route.get('/view',specController.loadSpec);
spec_route.get('/admin-view',specController.adminLoadSpec)
spec_route.put('/control-specialization/:specId',specController.changeStatus)
spec_route.delete('/delete-specialization/:specId',specController.deleteSpec)
spec_route.post('/edit-spec',upload.single('image'),specController.editSpec)




module.exports = spec_route;