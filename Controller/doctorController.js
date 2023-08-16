const Doctor = require('../Model/doctorModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Schedule = require('../Model/scheduleModel');
const Bookings = require('../Model/bookingModel')
const mongoose = require('mongoose')

require('dotenv').config()


function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}
const OTP = generateOTP();

const sendOtp = async (name, email, user_id) => {

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

const doctorRegister = async (req, res) => {

    try {

        const profileImgFile = req.files['profileimg'][0];

        const doctorexist = await Doctor.findOne({ email: req.body.email })
        if (!doctorexist) {
            const spassword = await securePassword(req.body.password);
            const doctor = new Doctor({
                name: req.body.name,
                email: req.body.email,
                password: spassword,
                profileimg: profileImgFile.filename,
                token: OTP

            })
            if (req.body.password === req.body.repassword) {

                const doctorData = await doctor.save();

                if (doctorData) {
                    sendOtp(req.body.name, req.body.email, doctor._id);
                    res.status(200).json({ id: doctor._id });
                } else {
                    res.status(400).json({ message: 'Failed to save doctor data' })
                }

            } else {
                res.status(401).json({ message: 'Password do not match' });
            }
        } else {
            res.status(409).json({ message: 'Doctor with the same email exists' })
        }
    } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


const resendOtp = async (req, res) => {
    try {
        const doctorId = req.body.doctorId
        let doctor = await Doctor.findById(doctorId)
        if (doctor) {
            doctor.token = OTP
            let doctorData = await doctor.save()
            if (doctorData) {
                sendOtp(doctor.name, doctor.email)
                res.status(200).json({ message: "Successfully send otp" })
            } else {
                res.status(400).json({ message: "Cannot save user data" })
            }
        } else {
            res.status(404).json({ message: "Cannot find user" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).status({ message:'Internal server error' })
    }
}

const sendVerifyMail = async (req, res) => {
    try {

        const doctorId = req.body.doctorId
        const doctor = await Doctor.findById(doctorId)

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
                   <p>We appreciate your request to be a part of our family.</p>
                   <p>It takes 24 hours to be verified by the admin.</p>
                   <p>We will inform you after verification.</p>`

        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'Failed to send verification email' });
            } else {
                console.log("Doctor verification mail has been send:- ", info.response);
                return res.status(200).json({ message: 'Check your mail for updates' });
            }
        });



    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    const { id, otp } = req.body;
    try {
        const doctor = await Doctor.findById(id)
        if (!doctor) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (doctor.token !== otp) {
            return res.status(401).json({ message: 'Incorrect OTP' });
        }
        doctor.status = true
        const docSave =await doctor.save();
        if (docSave) {
            res.status(200).json({message:'User saved successfully'})
        } else {
            res.status(400).json({message:'Cannot save user data'})
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}


const doctorLogin = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const doctor = await Doctor.findOne({ email: email })

        if (doctor) {

            if (doctor.isBlocked === true) {
                return res.status(403).json({ message: "You are blocked by the admin", user:'doctor' })
            }
            if (doctor.status === true) {
                const passwordMatch = await bcrypt.compare(password, doctor.password);
                if (passwordMatch) {
                    const role = 'doctor';
                    const doctortoken = jwt.sign({ doctorId: doctor._id, role: role }, process.env.DOCTOR_SECRET);
                    res.status(200).json({ doctor: doctortoken })
                } else {
                    res.status(401).json({ message: "Password do not match" })
                }
            } else {
                res.status(401).json({ message: 'You are not verified ' })
            }
        } else {
            return res.status(404).json({ message: 'User not found' })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal server error'})
    }
}

const findDoctor = async (req, res) => {

    try {

        const { doctorId } = req.decodedDoctor;
        const newid = new mongoose.Types.ObjectId(doctorId);
        const doctor = await Doctor.aggregate([
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
            // console.log(doctor, "doc data analysis");
            res.status(200).json({ doctor: doctor[0] });
        } else {
            res.status(404).json({ message: "Cound not find doctor" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}


const addMoreData = async (req, res) => {
    
    let amount = 0;
    try {
        const { age, gender, regno, specialization, experience, docId, fare } = req.body
        if (fare) {
            const price = parseInt(fare);
            const percentage = 15;
            const percentageAmount = (percentage / 100) * price;
            amount = price + percentageAmount;
        }
        const doctor = await Doctor.findByIdAndUpdate(docId,
            {
                age,
                gender,
                regno,
                specialization,
                experience,
                fare,
                final_fare: amount,
                certificate: req.file.filename,
            }, { new: true })
        if (!doctor) {
            res.status(404).json({ message: 'User not found.' })
        } else {
            res.status(200).json({ status: 'Successfully updated', doctor: doctor })
        }

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.log(error);
    }

}

const setSchedule = async (req, res) => {

    try {

        const { doctorId } = req.decodedDoctor;
        const { schedule } = req.body;
        const newSchedule = new Schedule({
            doc_id: doctorId,
            schedule: schedule.map((day) => ({
                day: day.day,
                time: day.time.map((timeslot) => ({
                    timeslot: timeslot.timeslot,
                })),
            })),
        });

        const updateDoc = await Doctor.findByIdAndUpdate(doctorId, { scheduled: true });

        if (updateDoc) {
            const scheduleSave = await newSchedule.save()
            if (scheduleSave) {
                res.status(200).json({ message: "Saved Schedule", schedule: scheduleSave })
            } else {
                res.status(400).json({ message: "Failed to save schedule" });
            }
        } else {
            res.status(400).json({ message: "Failed to update schedule in doctor profile" });
        }

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.log(error);
    }
}

const updateSchedule = async (req, res) => {

    try {

        const { doctorId } = req.decodedDoctor;
        const { schedule } = req.body;
        const updatedSchedule = await Schedule.findOneAndUpdate(
            { doc_id: doctorId },
            {
                schedule: schedule.map((day) => ({
                    day: day.day,
                    time: day.time.map((timeslot) => ({
                        timeslot: timeslot.timeslot,
                    })),
                })),
            },
            { new: true }
        );


        if (updateSchedule) {
            res.status(200).json({ message: "Updated schedule successfully", schedule: updatedSchedule })
        } else {
            res.status(404).json({ message: "Cannot find the schedule" })
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const viewDocSchedule = async (req, res) => {
    try {
        const { doctorId } = req.decodedDoctor;

        const doctor = await Doctor.findById(doctorId)
        if (doctor.scheduled === false) {
            return res.status(422).json({ message:'Complete your profile and update your schedule to start your journey' })
        }
        
        const schedule = await Schedule.findOne({
            doc_id: doctorId
        })
        if (schedule) {
            res.status(200).json({ message: "Doctors Schedule found", schedule: schedule })
        } else {
            res.status(404).json({ message: "Cannot find doctors schedule" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const loadDocEdit = async (req,res) => {
    try {

        const { doctorId } = req.decodedDoctor;
        let doctor = await Doctor.findById(doctorId);
        if (doctor) {
            if (req.body.name) {
                doctor.name = req.body.name
            }
            if (req.body.age) {
                doctor.age = req.body.age
            }
            if (req.body.regno) {
                doctor.regno = req.body.regno
            }
            if (req.body.experience) {
                doctor.experience = req.body.experience
            }
            if (req.body.fare) {
                doctor.fare = req.body.fare
            }
            if (req.body.gender) {
                doctor.gender = req.body.gender
            }
            if (req.body.specialization) {
                doctor.specialization = req.body.specialization
            }
            if (req.files && req.files.profileimg && req.files.profileimg[0]) {
                doctor.profileimg = req.files.profileimg[0].filename;
              }
              if (req.files && req.files.certificate && req.files.certificate[0]) {
                doctor.certificate = req.files.certificate[0].filename;
              }
              doctor.approval = false
            let docSave = await doctor.save()
            if (docSave) {
                res.status(200).json({message:'Successfully saved doctor'})
            } else {
                res.status(400).json({message:'Cannot save doctor'})
            }
            
        } else {
            res.status(404).json({message:'Cannot find user data'})
        }  
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Internal server error'})
    }
}

const loadAllBookings = async (req,res) => {
    try {
        const bookings = await Bookings.find({})
        if (bookings) {
            res.status(200).json({ message:"Bookings found",bookingData:bookings })
        } else {
            res.status(404).json({ message:"Bookings not found" })
        }
    } catch (error) {
        res.status(500).status({message:'Internal server error'})
        console.log(error);
    }
}





module.exports = {
    doctorRegister,
    resendOtp,
    verifyLogin,
    doctorLogin,
    findDoctor,
    sendVerifyMail,
    addMoreData,
    setSchedule,
    viewDocSchedule,
    updateSchedule,
    loadDocEdit,
    loadAllBookings
}