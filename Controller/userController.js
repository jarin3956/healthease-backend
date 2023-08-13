const User = require('../Model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const Spec = require('../Model/specializationModel')
const Doctor = require('../Model/doctorModel');
const Schedule = require('../Model/scheduleModel');
const Booking = require('../Model/bookingModel');



require('dotenv').config()


function generateOTP(secret) {

    const otp = speakeasy.totp({
        secret: secret.base32,
        digits: 6,
        window: 30,
    });
    return otp;
}

const secret = speakeasy.generateSecret({ length: 20 });


const OTP = generateOTP(secret);

const sendOtp = async (name, email) => {

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.EMAILID,
                pass: process.env.EMAILPASS
            }

        });

        const mailOptions = {
            from: process.env.EMAILID,
            to: email,
            subject: 'For Verification mail',
            html: '<p>Hii ' + name + ' This is your OTP  ' + OTP + '</p> ' + '<p>Please do not share this OTP with anyone.</p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been send:- ", info.response);
            }
        });



    } catch (error) {
        console.log(error.message);
    }
}



const securePassword = async (password) => {

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

const userRegister = async (req, res) => {


    try {
        const userfind = await User.findOne({ email: req.body.email })
        if (!userfind) {
            const spassword = await securePassword(req.body.password);
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: spassword,
                image: req.file.filename,
                token: OTP

            })
            if (req.body.password === req.body.repassword) {
                const userData = await user.save();
                if (userData) {
                    sendOtp(req.body.name, req.body.email);
                    setTimeout(async () => {
                        await User.findByIdAndUpdate(userData.id, { token: '' });
                    }, 60000);
                    res.status(200).json({ id: user._id });
                } else {
                    res.status(400).json({ message: 'Failed to save' })
                }
            } else {
                res.status(401).json({ message: 'Password do not match' });
            }
        } else {
            res.status(409).json({ message: 'Email already used' })
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred during registration' })
    }
}


const resendOtp = async (req, res) => {

    try {
        const userId = req.body.userId
        let user = await User.findById(userId)
        if (user) {
            user.token = OTP
            let userData = await user.save()
            if (userData) {
                sendOtp(user.name, user.email)
                res.json({ status: 'ok', message: "Successfully send otp" })
            } else {
                res.json({ status: 'error', message: "user cannot be saved" })
            }
        } else {
            res.json({ status: 'error', message: "user not found" })
        }
    } catch (error) {
        console.log(error.message);
    }
}


const verifyLogin = async (req, res) => {
    const { id, otp } = req.body;
    try {
        const user = await User.findById(id)
        if (user && user.token == otp) {
            user.status = true
            await user.save();
            res.json({ status: 'ok' });
        }
        else if (!user) {

            return res.json({ status: 'error', message: 'User not found' });
        }
        else if (user.token != otp) {

            return res.json({ status: 'error', message: 'Incorrect OTP' });
        }


    } catch (error) {
        console.log(error.message);
        res.json({ status: 'error', message: 'Internal server error' });
    }

}

const userLogin = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const user = await User.findOne({ email: email })

        if (user && user.status === true && user.password) {
            if (user.isBlocked === true) {
                return res.status(403).json({ message: "You are blocked by the admin" })
            }
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                const role = 'user';
                const token = jwt.sign({ userId: user._id, role: role }, process.env.USER_SECRET);
                res.status(200).json({ user: token })
            } else {
                res.status(401).json({ message: "Password do not match" })
            }
        } else {
            if (!user) {
                res.status(404).json({ message: "User not found" })
            } else if (!user.password) {
                res.status(400).json({ message: 'You might be registered with google auth' })
            }
            else {
                res.status(401).json({ message: 'User not verified ' })
            }

        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal server error, please try after sometime' })
    }
}

const findUser = async function (req, res) {
    try {

        const { userId } = req.decodedUser

        const user = await User.findById({ _id: userId });
        if (user) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                age: user.age,
                gender: user.gender,
                height: user.height,
                weight: user.weight,
                wallet: user.wallet,
                picture: user.picture
            });
        } else {
            res.status(404).json({ message: 'User not found' })
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error, Please try after sometime' })
        console.log(error);
    }
}

const addMoreData = async (req, res) => {
    try {
        const { age, gender, height, weight } = req.body;
        const { userId } = req.decodedUser;
        const user = await User.findByIdAndUpdate(userId,
            { age, gender, height, weight }, { new: true })
        if (user) {
            res.status(200).json({ user: user })
        } else {
            res.status(404).json({ message: 'User not found' })
        }

    } catch (error) {
        res.status(500).json({ message: 'Internal server error, Please try after sometime' })
    }
}

const profileEdit = async (req, res) => {
    
    try {
        const { userId } = req.decodedUser;
        let user = await User.findById(userId);
        if (user) {
            user.name = req.body.name;

            if (req.file) {
                user.image = req.file.filename;
            }

            if (req.body.age) {
                user.age = req.body.age;
            }
            if (req.body.height) {
                user.height = req.body.height;
            }
            if (req.body.weight) {
                user.weight = req.body.weight;
            }
            if (req.body.gender) {
                user.gender = req.body.gender;
            }

           const usersave = await user.save();
           if (usersave) {
            res.status(200).json({ updateduser: user });
           } else {
            res.status(400).json({message: 'Cannot save data, Please try after sometime'});
           }
        } else {
            res.status(404).json({ message: 'Cannot find user' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error, Please try after sometime' });
    }
};


// const viewSpec = async (req, res) => {
//     try {
//         const specData = await Spec.find({})
//         if (specData) {

//             res.json({ status: 'ok', spec: specData });
//         } else {
//             res.json({ status: 'error', message: 'Cannot find specialization' });
//         }
//     } catch (error) {
//         console.log(error);
//     }
// }

const loadDoctors = async (req, res) => {

    try {
        const specialName = req.params.specialName

        const specialization = await Spec.findOne({ name: specialName })

        const doctor = await Doctor.find({ specialization: specialization._id, scheduled: true, approval: true });

        if (doctor.length > 0) {
            res.status(200).json({ message: 'Doctors found', doctor: doctor })
        } else {
            res.status(404).json({ message: 'No doctors found' })
        }
    } catch (error) {
        res.status(500).status({message:'Internal server error, Please try after sometime'})
    }
}


const viewDocSlot = async (req, res) => {
    try {
        const docId = req.params.docId;
        const schedule = await Schedule.findOne({ doc_id: docId })
        if (schedule) {
            res.status(200).json({ message: "Schedule found", schedule: schedule.schedule })
        } else {
            res.status(404).json({ message: "Schedule not found" })
        }
    } catch (error) {
        res.status(500).status({message:'Internal server error, Please try after sometime'})
        console.log(error.message);
    }
}


const loadDocSpec = async (req, res) => {
    try {
        let specData = await Spec.find({ status: true })
        if (specData) {
            res.status(200).json({ spec: specData });
        } else {
            res.status(404).json({ message: 'No data found' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).status({message:'Internal server error, Please try after sometime'})
    }
}


const loadGoogleLogin = async (req, res) => {
    try {
        const data = req.body.user
        // console.log(data, 'google auth data for back');
        if (data) {
            const userfind = await User.findOne({ email: data.email })
            if (!userfind) {
                const user = new User({
                    name: data.given_name,
                    email: data.email,
                    picture: data.picture,
                    status: true
                })
                const userData = await user.save();
                if (userData) {
                    const role = 'user';
                    const token = jwt.sign({ userId: user._id, role: role }, process.env.USER_SECRET);
                    // console.log(token, "google auth token");
                    if (token) {
                        res.status(200).json({ message: 'google auth user created', user: token })
                    } else {
                        res.status(400).json({ message: 'Cannot generate token' })
                    }
                } else {
                    res.status(400).json({ message: 'Cannot save data, please try after sometime' })
                }

            } else {
                if (userfind.isBlocked === true) {
                    return res.status(403).json({ message: "You are blocked by admin" })
                }
                const role = 'user';
                const token = jwt.sign({ userId: userfind._id, role: role }, process.env.USER_SECRET);
                // console.log(token, "google auth token");
                if (token) {
                    res.status(200).json({ message: 'google auth user created', user: token })
                } else {
                    res.status(400).json({ message: 'Cannot generate token' })
                }
            }
        } else {
            res.status(400).json({ message: 'No login data found' })
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Cannot process now, please try after some time' })
    }
}






module.exports = {
    userRegister,
    resendOtp,
    userLogin,
    findUser,
    verifyLogin,
    addMoreData,
    profileEdit,
    // viewSpec,
    loadDoctors,
    viewDocSlot,
    loadDocSpec,
    loadGoogleLogin
}