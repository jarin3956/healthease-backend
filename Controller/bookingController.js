const Bookings = require('../Model/bookingModel');
const Doctor = require('../Model/doctorModel');
const Schedule = require('../Model/scheduleModel')
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
                    console.log(timeSlotToUpdate, "ithano mone prashnam");
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

const bookConsultation = async (req, res) => {
    try {

        const { selectedDay, selectedTime, selectedDate, docId, final_fare, payment_create_time, payment_update_time, payment_id } = req.body.paymentData;
        const userId = req.params.userId

        const booking = new Bookings({
            DocId: docId,
            UserId: userId,
            Booked_date: selectedDate,
            Booked_day: selectedDay,
            Booked_timeSlot: selectedTime,
            Fare: final_fare,
            Payment_id: payment_id,
            Payment_create_time: payment_create_time,
            Payment_update_time: payment_update_time
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

module.exports = {
    loadDoctor,
    bookConsultation,
    checDocAvailability
}