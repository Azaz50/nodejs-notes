import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";


const contactSchema = mongoose.Schema({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    address: {
        type: String
    }
})

contactSchema.plugin(mongoosePaginate);

const Contact = mongoose.model("Contact", contactSchema)

export default Contact;