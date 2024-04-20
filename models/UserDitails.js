const mongoose = require("mongoose");
const Register = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  gender: { type: String, required: true },
  mobile: { type: String, },
  password: { type: String, required: true },
  confirmPassword: { type: String, required: true },
});
const userDitails = mongoose.model("userdata", Register);
module.exports = userDitails;
