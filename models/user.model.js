import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  street: { type: String },
  dp: { type: String },
  dp_child: { type: String },
  validation_link: { type: String },
  is_active: Boolean,
  registration_date: { type: Date },
  activation_date: { type: Date }
});

UserSchema.pre("save", async function(next) {
  const user = this;
  user.registration_date = new Date();
  next();
});

UserSchema.statics.clearJunk = async function() {
  const { deletedCount } = await this.model("User")
    .deleteMany({
      is_active: false
    })
    .exec();
  return deletedCount;
};

const toJson = function(user) {
  return {
    _id: user._id,
    email: user.email,
    street: user.street,
    dp: user.dp,
    dp_child: user.dp_child,
    is_active: user.is_active
  };
};

export default mongoose.model("User", UserSchema);
