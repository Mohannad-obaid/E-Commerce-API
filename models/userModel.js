const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userShcema = new mongoose.Schema(
  {

    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },

    phone: String,

    profileImage: String,

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "TOOl short password"],
    },

    passwordChangedAt: Date,

    passwordResetCode: String,
    passwordResetExpire: Date,
    passwordResetVerified: Boolean,


    confirmAccountCode: String,
    confirmAccountExpire: Date,
    accountVerification: {
      type: Boolean,
      default: false
    },

    active: {
      type: Boolean,
      default: true,
    },

    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },

    provider: {
      type: String,
      enum: ["email", "facebook", "google"],
      default: "email",
    },

    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],

    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        alias: String,
        details: String,
        phone: String,
        city: String,
        postalCode: String,
      },
    ],
  },
  { timestamps: true }
);

/* 
const setImagUrl = (doc) => {
  if (doc.profileImage) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.profileImage}`;
    doc.profileImage = imageUrl;
  }
};

userShcema.post("init", (doc) => {
  setImagUrl(doc);
});

userShcema.post("save", (doc) => {
  setImagUrl(doc);
});
 */
userShcema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hash password
  this.password = await bcrypt.hash(this.password, 13);
  next();
});

const User = mongoose.model("User", userShcema);

module.exports = User;
