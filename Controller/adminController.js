const Admin = require('../Model/adminModel');
const Users = require('../Model/userModel');
const Doctors = require('../Model/doctorModel');
const Bookings = require('../Model/bookingModel');
const Spec = require('../Model/specializationModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose')

require('dotenv').config()

const securePassword = async (password) => {

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

const adminRegister = async function (req, res) {
    try {
        const existadmin = await Admin.findOne({ email: req.body.email })
        if (!existadmin) {
            const spassword = await securePassword(req.body.password);
            const admin = new Admin({
                name: req.body.name,
                email: req.body.email,
                password: spassword
            })
            if (req.body.password === req.body.repassword) {
                const adminData = await admin.save()
                if (adminData) {
                    res.json({ status: 'ok' })
                } else {
                    res.json({ status: 'error', message: 'Failed to save' })
                }
            } else {
                res.json({ status: 'error', message: 'Password do not match' })
            }
        } else {
            res.json({ status: 'error', message: 'Admin with this same email exists' })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
}

const adminLogin = async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const admin = await Admin.findOne({ email: email })
    if (admin) {
        const passwordMatch = await bcrypt.compare(password, admin.password)
        if (passwordMatch) {
            const role = 'admin';
            const admintoken = jwt.sign({ adminId: admin._id , role: role }, process.env.ADMIN_SECRET)
            return res.json({ status: 'ok', admin: admintoken })
        } else {
            return res.json({ status: 'error', message: "Password do not match" })
        }
    } else {
        return res.json({ status: 'error', message: 'No data found' })
    }
}

const findAdmin = async function (req, res) {
    try {
        const admin = await Admin.findById({ _id: req.params.adminId })
        if (admin) {
            const userCount = await Users.count()
            const bookingCount = await Bookings.count()
            const doctorCount = await Doctors.count()
            const specCount = await Spec.count()
            if (userCount && bookingCount && doctorCount && specCount) {

                const dashData = {
                    userCount,
                    bookingCount,
                    doctorCount,
                    specCount
                }

                res.status(200).json({ message:'Admin dashboard data found',dashData })
            } else {
                res.status(404).json({ message:'Admin dashboard not found' })
            }
        } else {
            res.status(404).json({ message:'Admin data not found' })
        }
        
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' })
        console.log(error.message);
    }
}

const loadUsers = async function (req, res) {
    try {
        const usersData = await Users.find({})
        if (usersData) {
            res.json({ users: usersData })
        } else {
            res.json({ status: 'error', message: 'No data found' })
        }
    } catch (error) {
        console.log(error);
    }
}



const loadDoctors = async function (req, res) {
    try {
        const doctorData = await Doctors.aggregate([
            {
                $match: {
                  specialization: { $regex: /^[0-9a-fA-F]{24}$/ }
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
                fare: 1,
                final_fare: 1,
                status: 1,
                token: 1,
                approval: 1,
                isBlocked: 1,
                specialization: {
                  $ifNull: ['$specializationData.name', 'Unknown']
                }
              }
            }
          ]);
          
          
          
    
        if (doctorData) {
            res.json({ doctors: doctorData })
        } else {
            res.json({ status: 'error', message: 'No data found' })
        }
    } catch (error) {
        console.log(error);
    }
}

const changeUserStatus = async function (req, res) {
    try {
        const { userId } = req.params;
        const user = await Users.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        user.isBlocked = !user.isBlocked
        await user.save();
        res.status(200).json({ message: 'Successfully Changed', user: user })

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.log(error);
    }
}

const changeDoctorStatus = async function (req, res) {
    try {
        const { doctorId } = req.params;
        const doctor = await Doctors.findById(doctorId)
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" })
        }
        if (doctor.approval === true) {
            doctor.approval = false
        } else {
            doctor.approval = true
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
                to: doctor.email,
                subject: 'For Verification mail',
                html: `<p>Hii Dr. ${doctor.name},</p>
                       <p>You are successfull verified by admin</p>
                       <p>You can now login to your account</p>
                       <p>Wishing you a good luck.</p>`
    
            }
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return res.status(500).json({ message: 'Failed to send verification email' });
                } else {
                    console.log("Doctor welcome mail has been send:- ", info.response);
                }
            });
    

        }
        await doctor.save();
        return res.status(200).json({ message: 'Changed Successfully',doctor:doctor });


    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.log(error);
    }
}


const handleBlocking = async (req,res) => {
    try {
        const { doctorId } = req.params;
        const doctor = await Doctors.findById(doctorId)
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" })
        }
        if (doctor.isBlocked === true) {
            doctor.isBlocked = false
        } else {
            doctor.isBlocked = true
        }
        await doctor.save();
        return res.status(200).json({ message: 'Changed Successfully',doctor:doctor });


    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.log(error);
    }
}

const loadBooking = async (req,res) =>{
    try {
        const bookings = await Bookings.find({})
        if (bookings) {
            res.status(200).json({ message:"Bookings found",bookingData:bookings })
        } else {
            res.status(404).json({ message:"Bookings not found" })
        }
    } catch (error) {
        console.log(error);
    }
}

const loadDoctorProfile = async (req,res) => {
    try {

        const newid = new mongoose.Types.ObjectId(req.params.doctorId)

        const doctor = await Doctors.aggregate([
            {
              $match: { _id: newid }
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
                  fare: 1,
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
            res.status(200).json({message:'Doctor found',doctorData:doctor[0]})
        } else {
            res.status(404).json({message:'Doctor not found'})
        }
    } catch (error) {
        console.log(error);
    }
}

const loadUserProfile = async (req,res) => {
    try {
        
        const userId = req.params.userId
        const user = await Users.findById(userId)
        if (user) {
            res.status(200).json({message:'User found',userData:user})
        } else {
            res.status(404).json({message:'User not found'})
        }
    } catch (error) {
        
    }
}

const loadChartData = async (req,res) => {
    try {
        const userResults = await Users.aggregate([
            {
              $facet: {
                usersData: [ { $match: {} } ], 
              },
            },
            {
              $project: {
                usersData: { createdAt: 1 },
              },
            },
          ]);

          const doctorResult = await Doctors.aggregate([
            {
                $facet:{
                    doctorsData: [ { $match: {} } ],
                    doctorsCount:[ { $count:'count' } ],
                }
            },
            {
                $project:{
                    doctorsData: { createdAt: 1 }, 
                    doctorsCount: { $arrayElemAt: ['$doctorsCount.count', 0] },
                }
            }
          ]);
      
          const usersData = userResults[0].usersData;
        //   const usersCount = userResults[0].usersCount;
          const doctorsData = doctorResult[0].doctorsData;
        //   const doctorsCount = doctorResult[0].doctorsCount;
          
          const chartData = {
            usersData,
            doctorsData,
          }

        
        

        console.log(chartData,"this is the chart data");
          

        if (chartData) {
            res.status(200).json({message:"Chart data found",chartData})
        } else {
            res.status(404).status({message:"Chart data not found"})
        }


    } catch (error) {
        
    }
}







module.exports = {
    adminRegister,
    adminLogin,
    findAdmin,
    loadUsers,
    loadDoctors,
    changeUserStatus,
    changeDoctorStatus,
    loadBooking,
    loadDoctorProfile,
    loadUserProfile,
    loadChartData,
    handleBlocking
}