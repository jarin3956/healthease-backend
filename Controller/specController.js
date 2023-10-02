const Spec = require('../Model/specializationModel') 

const specRegister = async (req,res) => {
    try {
        console.log(req.body.name,req.body.description,req.body.image,"spec reg data");
        const specFind = await Spec.findOne({name: req.body.name})
        if (!specFind) {
            const spec = new Spec({
                name:req.body.name,
                description : req.body.description,
                image: req.body.image,
            })
            const specData = await spec.save()
            if (specData) {
                res.status(200).json({ message: 'Specialization registered successfully' });
            } else {
                res.status(400).json({ message: 'Cannot save specialization' });
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
            res.status(404).json({ message: 'Cannot find data' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const changeStatus = async (req,res) => {

    try {

        let resMsg = '';

        const { specId } = req.params;
        const spec = await Spec.findById(specId)
        if (!spec) {
            return res.status(404).json({ message: 'Cannot find user' });
        } else {
            if (spec.status === true) {
                spec.status = false
                resMsg = `Specialization ${spec.name} blocked Successfull`
            } else {
                spec.status = true
                resMsg = `Specialization ${spec.name} unblocked Successfull`
            }
            // spec.status = !spec.status
            await spec.save()
            const allSpec = await Spec.find({})
            res.status(200).json({ message: resMsg, spec: spec });
            
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
            res.status(200).json({ message: `Deleted specialization ${spec.name} successfully` });
        } else {
            res.status(404).json({ message: `Cannot find specialization ${spec.name}s data` });
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
            if (req.body.image) {
                spec.image = req.body.image
            }
            await spec.save()

            const allSpec = await Spec.find({})

            res.status(200).json({ message: `Edited specialization ${spec.name} Successfully`, spec: allSpec });
        } else {
            res.status(404).json({ message: `Cannot save the specialization ${spec.name}s data` });
    
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.log(error);
    }
}

const adminLoadSpec = async (req,res) => {
    try {
        let specData = await Spec.find({ }).sort({ createdAt: -1 });
        if (specData) {
            res.status(200).json({ spec: specData });
        } else {
            res.status(404).json({ message: 'Cannot find data' });
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