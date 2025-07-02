import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth:{
user: process.env.Gmail_API,
pass: process.env.Gmail_PASS
  }
})

export default transporter;