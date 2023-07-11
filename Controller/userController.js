const User = require('../Model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const Spec = require('../Model/specializationModel')
const Doctor = require('../Model/doctorModel')


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
                    res.json({ status: 'ok', id: user._id });
                } else {
                    res.json({ status: 'error', message: 'Failed to save' })
                }
            } else {
                res.json({ status: 'error', message: 'Password do not match' });
            }
        } else {
            res.json({ status: 'error', message: 'Email already used' })
        }
    } catch (error) {
        res.json({ status: 'error', message: 'An error occurred during registration' })
    }
}


const resendOtp = async (req,res) => {
    console.log("hai where is the error");
    console.log(req.body.userId);
    try {
        const userId = req.body.userId
        let user = await User.findById(userId)
        if (user) {
            user.token = OTP
            let userData = await user.save()
            if (userData) {
                sendOtp(user.name,user.email)
                res.json({ status: 'ok',message:"Successfully send otp" })
            }else{
                res.json({ status: 'error',message:"user cannot be saved" })
            }
        } else {
            res.json({ status: 'error',message:"user not found" })
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
        if (user && user.status === true) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                const token = jwt.sign({ userId: user._id }, process.env.USER_SECRET);
                return res.json({ status: 'ok', user: token })
            } else {
                return res.json({ status: 'error', message: "Password do not match" })
            }
        } else {
            if (!user) {
                return res.json({ status: 'error', message: "User not found" })
            } else {
                return res.json({ status: 'error', message: 'User not verified or blocked' })
            }

        }
    } catch (error) {
        console.log(error.message);
    }
}

const findUser = async function (req, res) {
    try {
        const user = await User.findById({ _id: req.params.userId });
        if (user) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                age: user.age,
                gender: user.gender,
                height: user.height,
                weight: user.weight
            });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const addMoreData = async function (req, res) {
    try {
        const { age, gender, height, weight } = req.body;
        const userId = req.params.userId;
        const user = await User.findByIdAndUpdate(userId,
            { age, gender, height, weight }, { new: true })
        if (!user) {
            res.json({ status:'error',message:'User not found' })
        }
        res.json( {status:'ok',user:user} )    
    } catch (error) {
        res.json({ status:'error',message:'Cannot update now' })
    }
}

const profileEdit = async function (req, res) {
    try {
      const { userId } = req.params;
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
  
        await user.save();
        console.log("the is the user 123",user);
        res.json({ status: 'ok', updateduser: user });
      } else {
        res.json({ status: 'error', message: 'Cannot find user' });
      }
    } catch (error) {
      res.json({ status: 'error', message: 'Cannot save data' });
    }
  };

  const viewSpec = async (req,res) => {
    try {
        const specData = await Spec.find({})
        if (specData) {
            console.log(specData);
            res.json({ status: 'ok', spec: specData });
        } else {
            res.json({ status: 'error', message: 'Cannot find specialization' });
        }
    } catch (error) {
        console.log(error);
    }
  }

  const loadDoctors = async (req,res) => {

    try {
        const specialId = req.params.specialId
        
        const doctor = await Doctor.aggregate([
            {
                $match: {
                    specialization:specialId
                }
              },
            {
              $addFields: {
                specializationId: {
                  $toObjectId: '$specialization'
                }
              }
            },
            {
              $lookup: {
                from: 'specialization',
                localField: 'specializationId',
                foreignField: '_id',
                as: 'specializationData'
              }
            },
            {
              $unwind: {
                path: '$specializationData',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                age: 1,
                gender: 1,
                regno: 1,
                experience: 1,
                email: 1,
                password: 1,
                profileimg: 1,
                certificate: 1,
                status: 1,
                token: 1,
                approval: 1,
                specialization: {
                  $ifNull: ['$specializationData.name', 'Unknown']
                }
              }
            }
          ]);
        if (doctor) {
            res.json( {status:'ok',doctor:doctor} )
        } else {
            res.json({ status:'error',message:'No doctors found' })
        }
    } catch (error) {
        console.log(error);
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
    viewSpec,
    loadDoctors
}