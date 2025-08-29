import mongoose from "mongoose";

const BootstrapSchema = new mongoose.Schema({
    siteTitle: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    banner: {
        link: {
            type: String,
            required: true
        },
        src: {
            type: String,
            required: true
        }
    },
    menu: {
        type: Array, // Assuming `menuItems` is an array
        required: true
    },
    footerAbout: {
        type: String,
        required: true
    }
});

const Bootstrap = mongoose.model("Bootstrap", BootstrapSchema);

export default Bootstrap;
