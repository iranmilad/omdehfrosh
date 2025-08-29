import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    children: [
        {
            image: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ]
});

const Brand = mongoose.model("Brand", BrandSchema);

export default Brand;
