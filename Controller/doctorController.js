const Doctor = require('../Model/doctorModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Schedule = require('../Model/scheduleModel')

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
                    res.json({ status: 'ok', id: doctor._id });
                } else {
                    res.json({ status: 'error', message: 'Failed to save' })
                }

            } else {
                res.json({ status: 'error', message: 'Password do not match' });
            }
        } else {
            res.json({ status: 'error', message: 'Doctor with the same email exists' })
        }
    } catch (error) {

        console.error(error);
        return res.json({ status: 'error', error: 'An error occurred during registration' });
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

            return res.json({ status: 'error', message: 'User not found' });
        }
        if (doctor.token !== otp) {

            return res.json({ status: 'error', message: 'Incorrect OTP' });
        }
        doctor.status = true
        await doctor.save();
        res.json({ status: 'ok' });

    } catch (error) {
        console.log(error.message);
        res.json({ status: 'error', message: 'Internal server error' });
    }

}


const doctorLogin = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const doctor = await Doctor.findOne({ email: email })

        if (doctor) {
            if (doctor.status === true) {
                const passwordMatch = await bcrypt.compare(password, doctor.password);
                if (passwordMatch) {

                    const doctortoken = jwt.sign({ doctorId: doctor._id }, process.env.DOCTOR_SECRET);

                    return res.json({ status: 'ok', doctor: doctortoken })
                } else {
                    return res.json({ status: 'error', message: 'Password do not match' })
                }
            } else {

                return res.json({ status: 'error', message: 'You are not verified ' })

            }
        } else {

            return res.json({ status: 'error', message: 'User not found' })

        }
    } catch (error) {
        console.log(error.message);
    }
}

const findDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById({ _id: req.params.doctorId });
        if (doctor) {
            res.status(200).json({
                _id: doctor._id,
                name: doctor.name,
                age: doctor.age,
                gender: doctor.gender,
                regno: doctor.regno,
                specialization: doctor.specialization,
                experience: doctor.experience,
                email: doctor.email,
                profileimg: doctor.profileimg,
                certificate: doctor.certificate,
                approval: doctor.approval

            });
        }
    } catch (error) {
        console.log(error.message);
    }
}


const addMoreData = async (req, res) => {
    console.log(req.body, "this is body");
    try {
        const { age, gender, regno, specialization, experience, docId } = req.body
        const doctor = await Doctor.findByIdAndUpdate(docId,
            {
                age,
                gender,
                regno,
                specialization,
                experience,
                certificate: req.file.filename,
            }, { new: true })
        if (!doctor) {
            res.status(404).json({ message: 'User not found' })
        } else {
            res.status(200).json({ status: 'Successfully updated', doctor: doctor })
        }

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.log(error);
    }

}

const setSchedule = async (req,res) =>{
    try {
        const { selectedTimeSlots, selectedDays } = req.body;

        const schedule = new Schedule({
            doc_id: req.params.doctorId,
            Day :selectedDays,
            Time :  selectedTimeSlots
        })
        const scheduleSave = await schedule.save()
        if (scheduleSave) {
            res.status(200).json({message:"Saved Schedule"})
        } else {
            res.status(500).json({ message: "Failed to save schedule" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.log(error);
    }
}

const viewDocSchedule = async (req,res) => {
    try {
        const schedule = await Schedule.findOne({
            doc_id:req.params.doctorId
        })
        if (schedule) {
            console.log(schedule);
            res.status(200).json({message:"Doctors Schedule found",schedule:schedule})
        } else {
            res.status(404).json({message:"Cannot find doctors schedule"})
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
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
    viewDocSchedule
}