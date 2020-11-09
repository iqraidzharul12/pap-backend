import * as nodemailer from "nodemailer"
import { Pharmacy, TestLab } from "../entity";

export const sendMail = async (recipient: string, subject: string, body: string) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "noreply.paprogram@gmail.com",
      pass: "Password@123",
    },
  });

  return await transporter.sendMail({
    from: '"No Reply PAP" <noreply.paprogram@gmail.com>', // sender address
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
  body: "Password akun Anda telah berhasil diubah. \nJika Anda merasa tidak mengubah password Anda, hubungi kami di help@papprogram.com."
}

export const ResetPasswordEmail = (url: string) => {
  return {
    subject: "Reset Password",
    body: `Password akun Anda akan direset dengan menggunakan link berikut: ${url}. \nJika Anda merasa tidak melakukan permintaan ini, hubungi kami di help@papprogram.com.`
  }
}

export const SignedDocumentEmail = {
  subject: "Dokumen Persetujuan",
  body: "Dokumen Persetujuan Anda telah berhasil ditanda tangani. \nJika Anda merasa tidak melakukan hal ini, hubungi kami di help@papprogram.com."
}

export const ConfirmTestLabEmail = (testLab: TestLab) => {
  return {
    subject: "Pengajuan Tes Laboratorium Diterima",
    body: `Pengajuan tes laboratorium Anda diterima, silakan lakukan tes di \n<b>${testLab.laboratorium.name}<b> \n${testLab.laboratorium.address}.`
  }
}

export const ConfirmTestEvidenceEmail = {
  subject: "Unggah Hasil Tes Laboratorium",
  body: "Hasil tes laboratorium Anda telah berhasil diunggah. \nSilakan mengajukan program PAP di aplikasi."
}

export const ConfirmDrugsEmail = (pharmacy: Pharmacy) => {
  return {
    subject: "Pengambilan Obat",
    body: `Anda telah melakukan pengambilan obat di \n<b>${pharmacy.name}<b> \n${pharmacy.address}.`
  }
}

export const ContinueProgramEmail = {
  subject: "Perpanjangan Program",
  body: "Program PAP Anda telah berhasil diperpanjang."
}

export const TerminateProgramEmail = {
  subject: "Pemberhentian Program",
  body: "Program PAP Anda telah diberhentikan."
}