const Spec = require('../Model/specializationModel') 

const specRegister = async (req,res) => {
    try {

        const specFind = await Spec.findOne({name: req.body.name})
        if (!specFind) {
            const spec = new Spec({
                name:req.body.name,
                description : req.body.description,
                image:req.file.filename
            })
            const specData = await spec.save()
            if (specData) {
                res.status(200).json({ message: 'Specialization saved successfully' });
            } else {
                res.status(500).json({ message: 'Cannot save specialization' });
            }
        } else {
            res.status(409).json({ message: 'Specialization already exists' });
        }
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const loadSpec = async (req,res) => {
    try {
        let specData = await Spec.find({ status: true })
        if (specData) {
            res.status(200).json({ spec: specData });
        } else {
            res.status(404).json({ message: 'No data found' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const changeStatus = async (req,res) => {
    try {
        const { specId } = req.params;
        const spec = await Spec.findById(specId)
        if (!spec) {
            return res.status(404).json({ message: 'User not found' });
        } else {
            spec.status = !spec.status
            await spec.save()
            const allSpec = await Spec.find({})
            res.status(200).json({ message: 'success', spec: spec });
            
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const deleteSpec = async (req,res) => {
    
    try {
        const { specId } = req.params;
        const spec = await Spec.findByIdAndDelete(specId)
        if (spec) {
            res.status(200).json({ message: 'Deleted successfully' });
        } else {
            res.status(404).json({ message: 'Cannot found the specialization' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const editSpec = async (req,res) => {
    try {
        let spec = await Spec.findById(req.body.specid)
        if (spec) {
            spec.name = req.body.name
            spec.description=  req.body.description
            if (req.file) {
                spec.image = req.file.filename
            }
            await spec.save()
            const allSpec = await Spec.find({})

            res.status(200).json({ message: 'Saved Successfully', spec: allSpec });
        } else {
            res.status(404).json({ message: 'Cannot save the specialization' });
    
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.log(error);
    }
}

const adminLoadSpec = async (req,res) => {
    try {
        let specData = await Spec.find({ })
        if (specData) {
            res.status(200).json({ spec: specData });
        } else {
            res.status(404).json({ message: 'No data found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.log(error);
    }
}



module.exports = {
    specRegister,
    loadSpec,
    changeStatus,
    deleteSpec,
    editSpec,
    adminLoadSpec
}