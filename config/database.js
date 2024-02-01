import mongoose from "mongoose";

const connectDatabase = () => {
    mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then((c) => { console.log(`Database Connected ${c.connection.host}`); })
}

export default connectDatabase     