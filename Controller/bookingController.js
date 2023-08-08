const Bookings = require('../Model/bookingModel');
const Doctor = require('../Model/doctorModel');
const Schedule = require('../Model/scheduleModel');
const User = require('../Model/userModel')
const mongoose = require('mongoose')

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
                    // console.log(timeSlotToUpdate, "ithano mone prashnam");
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
        const userId = req.params.userId

        const user = await User.findById(userId)

        if (user) {

            let walletBalance = 0;
            
            for (const transaction of user.wallet) {
                if (transaction.type === 'C') {
                    walletBalance += transaction.amount; // Credit
                } else if (transaction.type === 'D') {
                    walletBalance -= transaction.amount; // Debit
                }
            }

            res.status(200).json({ message: 'User wallet found', wallet: walletBalance });

            // res.status(200).json({ message: 'User wallet found', wallet: user.wallet })
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
        const userId = req.params.userId
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
                                res.status(500).json({ message: "Failed to save bookings" });
                            }
                        } else {
                            res.status(500).json({ message: "Failed to update doctors slot" });
                        }
                    } else {
                        booking.Status = 'FAILED';
                        const booked = booking.save()
                        res.status(409).json({ message: "The selected time slot is already booked." });
                    }
                } else {
                    res.status(500).json({ message: "Failed to save bookings" });
                }

            } else {
                res.status(500).json({ message: "Failed to save bookings" });
            }
        } else {
            res.status(500).json({ message: "Failed to save bookings" });
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
        const userId = req.params.userId
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
        // const newBalance = user.wallet - final_fare
        // user.wallet = newBalance
        user.wallet.push({
            amount: final_fare, // Negative value indicates debit
            timestamp: new Date(),
            type: 'D' // Debit
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
                                    res.status(500).json({ message: "Failed to save bookings" });
                                }
                            } else {
                                res.status(500).json({ message: "Failed to update doctors slot" });
                            }
                        } else {
                            booking.Status = 'FAILED';
                            const booked = booking.save()
                            res.status(409).json({ message: "The selected time slot is already booked." });
                        }
                    } else {
                        res.status(500).json({ message: "Failed to save bookings" });
                    }

                } else {
                    res.status(500).json({ message: "Failed to save bookings" });
                }
            } else {
                res.status(500).json({ message: "Failed to save bookings" });
            }
        } else {
            res.status(500).json({ message: "Failed to find and update wallet" });

        }

    } catch (error) {
        console.log(error);
    }
}

const loadDoctorBooking = async (req, res) => {
    try {
        const { doctorId } = req.params;
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

        const { userId } = req.params
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

        // console.log('kennnnnnnnnnnnn',bookingDataWithDoctorData);

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
            // const user = await User.findByIdAndUpdate(booking.UserId, { $inc: { wallet: booking.Fare } })
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
                    res.status(500).json({ message: 'Internal server error, could not save the data' })
                }
            } else {
                res.status(500).json({ message: 'Internal server error, could not save the make the wallet update' })
            }
        } else {
            res.status(404).json({ message: "Cound not found the booking" })
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' })
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
    walletBookConsultation
}