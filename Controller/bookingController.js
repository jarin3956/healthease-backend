const Bookings = require('../Model/bookingModel');
const Doctor = require('../Model/doctorModel');
const Schedule = require('../Model/scheduleModel');
const User = require('../Model/userModel');
const Feedback = require('../Model/feedbackModel');
const mongoose = require('mongoose');
const Prescription = require('../Model/prescriptionModel')


const loadDoctor = async (req, res) => {
    try {
        const { docId } = req.params;

        const newid = new mongoose.Types.ObjectId(docId)

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
                    final_fare: 1,
                    status: 1,
                    token: 1,
                    approval: 1,
                    specialization: {
                        $ifNull: ['$specializationData.name', 'Unknown']
                    }
                }
            }
        ])

        if (doctor) {
            res.status(200).json({ message: " Found doc in bookings", doctorData: doctor[0] })
        } else {
            res.status(404).json({ message: "Doc not found" })
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

const checDocAvailability = async (req, res) => {
    try {

        const { selectedDay, selectedTime, docId } = req.body.verifyData

        const schedule = await Schedule.findOne({ doc_id: docId })

        if (schedule) {
            const dayToUpdate = schedule.schedule.find(day => day.day === selectedDay);
            if (dayToUpdate) {
                const timeSlotToUpdate = dayToUpdate.time.find(time => time.timeslot === selectedTime)
                if (timeSlotToUpdate) {
                    if (timeSlotToUpdate.isAvailable) {
                        res.status(200).json({ message: "The is okay for booking" });
                    } else {
                        res.status(409).json({ message: "The selected time slot is already booked." });
                    }
                } else {
                    res.status(404).json({ message: "Selected time slot not found in the schedule." });
                }
            } else {
                res.status(404).json({ message: "Selected day not found in the schedule." });
            }
        } else {
            res.status(404).json({ message: "Doctor's schedule not found." });
        }

    } catch (error) {
        res.status(500).json({ message: "An error occurred while checking availability." });
    }
}

const loadUserWallet = async (req, res) => {
    try {
        const { userId } = req.decodedUser

        const user = await User.findById(userId)

        if (user) {

            let walletBalance = 0;

            for (const transaction of user.wallet) {
                if (transaction.type === 'C') {
                    walletBalance += transaction.amount;
                } else if (transaction.type === 'D') {
                    walletBalance -= transaction.amount;
                }
            }

            res.status(200).json({ message: 'User wallet found', wallet: walletBalance });

        } else {
            res.status(404).json({ message: 'User not found' })
        }

    } catch (error) {
        res.status(500).json({ message: 'Internal server error, please try after sometime' })
    }
}

const bookConsultation = async (req, res) => {
    try {

        const { selectedDay, selectedTime, selectedDate, docId, final_fare, payment_create_time, payment_update_time, payment_id } = req.body.paymentData;
        const { userId } = req.decodedUser
        const paymentType = 'paypal'
        const booking = new Bookings({
            DocId: docId,
            UserId: userId,
            Booked_date: selectedDate,
            Booked_day: selectedDay,
            Booked_timeSlot: selectedTime,
            Fare: final_fare,
            Payment_id: payment_id,
            Payment_create_time: payment_create_time,
            Payment_update_time: payment_update_time,
            Payment_type: paymentType
        })


        const schedule = await Schedule.findOne({ doc_id: docId })
        if (schedule) {
            const dayToUpdate = schedule.schedule.find(day => day.day === selectedDay);
            if (dayToUpdate) {
                const timeSlotToUpdate = dayToUpdate.time.find(time => time.timeslot === selectedTime);
                if (timeSlotToUpdate) {

                    if (timeSlotToUpdate.isAvailable) {
                        timeSlotToUpdate.isAvailable = false;
                        const scheduleSave = await schedule.save();
                        if (scheduleSave) {
                            const booked = booking.save();
                            if (booked) {
                                res.status(200).json({ message: "Booking Saved Successfully", bookingData: booking });
                            } else {
                                res.status(400).json({ message: "Failed to save bookings" });
                            }
                        } else {
                            res.status(400).json({ message: "Failed to update doctors slot" });
                        }
                    } else {
                        booking.Status = 'FAILED';
                        const booked = booking.save()
                        res.status(409).json({ message: "The selected time slot is already booked." });
                    }
                } else {
                    res.status(400).json({ message: "Failed to save bookings" });
                }

            } else {
                res.status(400).json({ message: "Failed to save bookings" });
            }
        } else {
            res.status(400).json({ message: "Failed to save bookings" });
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred during the booking process" });
    }
}

const walletBookConsultation = async (req, res) => {
    const generateRandomNumber = () => {
        const min = 1000000000000000;
        const max = 9999999999999999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    try {
        const { selectedDay, selectedTime, selectedDate, docId, final_fare } = req.body.bookingData;
        const { userId } = req.decodedUser;
        const paymentType = 'wallet'
        const booking = new Bookings({
            DocId: docId,
            UserId: userId,
            Booked_date: selectedDate,
            Booked_day: selectedDay,
            Booked_timeSlot: selectedTime,
            Fare: final_fare,
            Payment_id: '',
            Payment_create_time: Date.now(),
            Payment_update_time: Date.now(),
            Payment_type: paymentType
        });

        const user = await User.findById(userId)

        user.wallet.push({
            amount: final_fare,
            timestamp: new Date(),
            type: 'D'
        });

        const walletUpdate = user.save()
        if (walletUpdate) {
            const paymentId = generateRandomNumber();

            booking.Payment_id = paymentId;

            const schedule = await Schedule.findOne({ doc_id: docId })

            if (schedule) {
                const dayToUpdate = schedule.schedule.find(day => day.day === selectedDay);
                if (dayToUpdate) {
                    const timeSlotToUpdate = dayToUpdate.time.find(time => time.timeslot === selectedTime);
                    if (timeSlotToUpdate) {

                        if (timeSlotToUpdate.isAvailable) {
                            timeSlotToUpdate.isAvailable = false;
                            const scheduleSave = await schedule.save();
                            if (scheduleSave) {
                                const booked = booking.save();
                                if (booked) {
                                    res.status(200).json({ message: "Booking Saved Successfully", bookingData: booking });
                                } else {
                                    res.status(400).json({ message: "Failed to save bookings" });
                                }
                            } else {
                                res.status(400).json({ message: "Failed to update doctors slot" });
                            }
                        } else {
                            booking.Status = 'FAILED';
                            const booked = booking.save()
                            res.status(409).json({ message: "The selected time slot is already booked." });
                        }
                    } else {
                        res.status(400).json({ message: "Failed to save bookings" });
                    }

                } else {
                    res.status(400).json({ message: "Failed to save bookings" });
                }
            } else {
                res.status(400).json({ message: "Failed to save bookings" });
            }
        } else {
            res.status(400).json({ message: "Failed to find and update wallet" });

        }

    } catch (error) {
        res.status(500).status({ message: 'Internal server error, Please try after sometime' })
        console.log(error);
    }
}

const loadDoctorBooking = async (req, res) => {

    try {

        const { doctorId } = req.decodedDoctor;
        const booking = await Bookings.find({ DocId: doctorId }).sort({ CreatedAt: -1 });
        if (booking.length === 0) {
            return res.status(404).json({ message: 'Doctor bookings not found' });
        }

        const userIds = [...new Set(booking.map((booking) => booking.UserId))];

        const users = await User.find({ _id: { $in: userIds } }).lean().exec();

        const bookingDataWithUserData = booking.map((booking) => {
            const user = users.find((user) => user._id.toString() === booking.UserId);
            return {
                bookingData: booking,
                userData: user
            };
        });

        res.status(200).json({ message: 'Doctor bookings found', bookingData: bookingDataWithUserData });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const loadUserBooking = async (req, res) => {
    try {

        const { userId } = req.decodedUser
        const booking = await Bookings.find({ UserId: userId }).sort({ CreatedAt: -1 });
        if (booking.length === 0) {
            return res.status(404).json({ message: 'User booking not found' })
        }

        const doctorIds = [...new Set(booking.map((booking) => booking.DocId))];

        const doctors = await Doctor.find({ _id: { $in: doctorIds } }).lean().exec();

        const bookingDataWithDoctorData = booking.map((booking) => {
            const doctor = doctors.find((doctor) => doctor._id.toString() === booking.DocId);
            return {
                bookingData: booking,
                doctorData: doctor
            }
        })

        res.status(200).json({ message: "User booking Found", bookingData: bookingDataWithDoctorData })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });

    }
}

const cancelBooking = async (req, res) => {
    try {

        const bookingId = req.params.bookingId;
        const booking = await Bookings.findById(bookingId)
        if (booking) {

            const user = await User.findByIdAndUpdate(booking.UserId, {
                $push: {
                    wallet: {
                        amount: booking.Fare,
                        type: 'C',
                    },
                },
            });

            if (user) {
                booking.Status = 'CANCELLED'
                const bookingSave = await booking.save()
                if (bookingSave) {
                    res.status(200).json({ message: 'Cancelled Booking' })
                } else {
                    res.status(400).json({ message: 'Internal server error, could not save the data' })
                }
            } else {
                res.status(400).json({ message: 'Internal server error, could not save the make the wallet update' })
            }
        } else {
            res.status(404).json({ message: "Cound not found the booking" })
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' })
    }
}

const updateCompleted = async (req, res) => {
    try {
        let bookingId = req.params.bookingConfirmId
        const booking = await Bookings.findById(bookingId)
        if (booking) {
            if (booking.Status === 'PENDING') {
                booking.Status = 'COMPLETED'
            }
            const updated = await booking.save()
            if (updated) {
                res.status(200).json({ message: 'Completed successfully' })
            } else {
                res.status(400).json({ message: 'Cannot save data' })
            }
        } else {
            res.status(404).json({ message: 'Cannot find booking data' })
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' })
        console.log(error);
    }
}

const updateFeedback = async (req, res) => {

    try {

        const { rating, comments, bookingId } = req.body
        const newid = new mongoose.Types.ObjectId(bookingId)
        const feedbackFound = await Feedback.findOne({ bookingId: newid })
        if (!feedbackFound) {
            const booking = await Bookings.findById(bookingId)
            if (booking) {
                const feedback = new Feedback({
                    bookingId: bookingId,
                    userId: booking.UserId,
                    docId: booking.DocId,
                    rating,
                    comments,
                })
                const saveFeedback = await feedback.save();
                if (saveFeedback) {
                    res.status(200).json({ message: 'Feedback saved successfully' })
                } else {
                    res.status(400).json({ message: 'Cannot save feedback' })
                }

            } else {
                res.status(404).json({ message: 'Booking data not found' })
            }
        } else {
            res.status(409).json({ message: 'Feedback already exists' })
        }

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' })
        console.log(error);
    }
}


const uploadPrescription = async (req, res) => {

    try {

        const { bookingId, description, prescription, recomentations } = req.body;
        const newid = new mongoose.Types.ObjectId(bookingId)
        const prescfind = await Prescription.findOne({ bookingId: newid })
        if (!prescfind) {
            const booking = await Bookings.findById(bookingId)
            if (booking) {
                const presc = new Prescription({
                    bookingId,
                    userId: booking.UserId,
                    docId: booking.DocId,
                    description: description,
                    prescription: prescription,
                    recomentation: recomentations
                })
                const update = await presc.save()
                if (update) {
                    res.status(200).json({ message: "Succesfully submited the prescption" })
                } else {
                    res.status(400).json({ message: "Cannot save the prescription" })
                }
            } else {
                res.status(404).json({ message:'Cannot find booking data' })
            }
        } else {
            res.status(409).json({ message: 'Prescription already exist'})
        }

    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

const viewUserPrescription = async (req,res) => {

    try {
        const {bookingId} = req.params;
        const presc = await Prescription.findOne({ bookingId:bookingId });
        if (presc) {
            res.status(200).json({ message:'Prescription Found', presc})
        } else {
            res.status(404).json({message:'Could not find the prescription'})
        }
    } catch (error) {
        res.status(500).json({message:'Internal server error'})
    }
}


module.exports = {
    loadDoctor,
    bookConsultation,
    checDocAvailability,
    loadDoctorBooking,
    cancelBooking,
    loadUserBooking,
    loadUserWallet,
    walletBookConsultation,
    updateCompleted,
    updateFeedback,
    uploadPrescription,
    viewUserPrescription
}