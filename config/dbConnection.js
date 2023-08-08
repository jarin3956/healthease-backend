const {connect}=require('mongoose')
const connectDB = () => {
    connect(process.env.MONGO_URL).then(()=>console.log(`db connected`))
}
module.exports = connectDB