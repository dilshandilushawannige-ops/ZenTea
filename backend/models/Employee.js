import mongoose from 'mongoose';

const { Schema } = mongoose;

const employeeSchema = new Schema({
    // ...existing schema fields...
    epfNo: {
        type: String,
        required: true,
        unique: true
    },
    etfNo: {
        type: String,
        required: true,
        unique: true
    }
    // ...remaining schema fields...
});

export default mongoose.model('Employee', employeeSchema);