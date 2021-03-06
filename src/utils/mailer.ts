import * as nodemailer from "nodemailer"
import { Pharmacy, TestLab } from "../entity";

export const sendMail = async (recipient: string, subject: string, body: string) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "pulihapp@gmail.com",
      pass: "pappulih2021",
    },
  });

  return await transporter.sendMail({
    from: '"No Reply PULIH" <pulihapp@gmail.com>', // sender address
    to: recipient, // list of receivers
    subject: subject, // Subject line
    text: body, // plain text body
    html: htmlBodyFormat(subject, body), // html body
  });
}

const htmlBodyFormat = (title: string, body: string) => {
  return `
  <table border="0" cellpadding="0" cellspacing="0" width="100%" align="center" width="600">
  <tr>
    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 24px;">
    <b>${title}</b>
   </td>
  </tr>
  <tr>
   <td>
    ${body}
   </td>
  </tr>
 </table>
  `
}

export const RegisterMail = {
  subject: "Pendaftaran Berhasil",
  body: "Selamat, pendaftaran akun Anda telah berhasil, \nAnda dapat mendaftarkan program Anda melalui aplikasi."
}

export const ChangePasswordEmail = {
  subject: "Password Berhasil Diubah",
  body: "Password akun Anda telah berhasil diubah. \nJika Anda merasa tidak mengubah password Anda, hubungi kami di pulihapp@gmail.com."
}

// export const ResetPasswordEmail = (url: string) => {
//   return {
//     subject: "Reset Password",
//     body: `Password akun Anda akan direset dengan menggunakan link berikut: ${url}. \nJika Anda merasa tidak melakukan permintaan ini, hubungi kami di pulihapp@gmail.com.`
//   }
// }

export const SignedDocumentEmail = {
  subject: "Dokumen Persetujuan",
  body: "Dokumen Persetujuan Anda telah berhasil ditanda tangani. \nJika Anda merasa tidak melakukan hal ini, hubungi kami di pulihapp@gmail.com."
}

export const ConfirmTestLabEmail = (testLab: TestLab) => {
  return {
    subject: "Pengajuan Tes Laboratorium Diterima",
    body: `Pengajuan tes laboratorium Anda diterima, silakan lakukan tes di \n<b>${testLab.laboratorium.name}<b> \n${testLab.laboratorium.address}.`
  }
}

export const ConfirmTestEvidenceEmail = {
  subject: "Unggah Hasil Tes Laboratorium",
  body: "Hasil tes laboratorium Anda telah berhasil diunggah. \nSilakan mengajukan program PULIH di aplikasi."
}

export const ConfirmDrugsEmail = (pharmacy: Pharmacy) => {
  return {
    subject: "Pengambilan Obat",
    body: `Anda telah melakukan pengambilan obat di \n<b>${pharmacy.name}<b> \n${pharmacy.address}.`
  }
}

export const ContinueProgramEmail = {
  subject: "Perpanjangan Program",
  body: "program PULIH Anda telah berhasil diperpanjang."
}

export const TerminateProgramEmail = {
  subject: "Pemberhentian Program",
  body: "program PULIH Anda telah diberhentikan."
}

export const ResetPasswordEmail = (password: String) => {
  return {
    subject: "Reset Password",
    body: `Anda telah melakukan reset password. \npassword baru Anda adalah ${password}.`
  }
}

export const NewPasswordEmail = (password: String, role: String) => {
  return {
    subject: `Pendaftaran ${role}`,
    body:  `Anda telah terdaftar sebagai ${role}. \npassword Anda adalah ${password}.`
  }
}