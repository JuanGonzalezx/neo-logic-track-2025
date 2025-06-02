const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const { findCityById } = require('../lib/cityServiceClient');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ⚠️ Esto permite certificados autofirmados
  }
});

const generateVerificationCode = async () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Función para enviar el correo electrónico con el código de verificación
const sendEmail = async (email, code, fullname, use) => {
  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "",
    html: "",
  };

  try {
    if (use === "verification") {
      mailOptions.subject = "Código de verificación para tu cuenta";
      mailOptions.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Verificación de cuenta</h2>
          <p>Hola ${fullname},</p>
          <p>Gracias por registrarte. Para completar tu registro, por favor utiliza el siguiente código de verificación:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>Este código expirará en 15 minutos.</p>
          <p>Si no has solicitado este código, por favor ignora este correo.</p>
          <p>Saludos,<br>El equipo de soporte</p>
        </div>
      `;
    } else if (use === "authentication") {
      mailOptions.subject = "Código para ingresar a tu cuenta";
      mailOptions.html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Autenticación de tu cuenta</h2>
          <p>Hola ${fullname},</p>
          <p>Gracias por ingresar. Para completar tu ingreso, por favor utiliza el siguiente código de autenticación:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>Este código expirará en 15 minutos.</p>
          <p>Si no has solicitado este código, por favor ignora este correo.</p>
          <p>Saludos,<br>El equipo de soporte</p>
        </div>
      `;
    } else {
      throw new Error("Uso de correo inválido: debe ser 'verification' o 'authentication'");
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado: " + info.response);
    return true;

  } catch (error) {
    console.error("Error enviando el email:", error);
    return false;
  }
};

const sendEmailStock = async (req, res) => {

  let { email, fullname, producto } = req.body
  console.log(req.body);


  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "",
    html: "",
  };

  try {
    mailOptions.subject = `Stock agotado`;
    mailOptions.html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
            <h2 style="color: #333; text-align: center;"></h2>
            <p>Hola ${fullname},</p>
            <p>El stock del producto ${producto} está por debajo del nivel de reorden</p>

            <p>Solicita este producto antes de que acabe</p>
            <p>Saludos,<br>El equipo de soporte</p>
          </div>
        `;

    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado: " + info.response);
    res.status(200).json({
      message: "Email sended"
    });

  } catch (error) {
    console.error("Error enviando el email:", error);
    return false;
  }
};

const sendEmailOrder = async (req, res) => {

  let { email, fullname, order } = req.body
  console.log(req.body);

  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "",
    html: "",
  };

  try {
    mailOptions.subject = `Pedido creado`;
    mailOptions.html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
            <h2 style="color: #333; text-align: center;"> Hola ${fullname} </h2>
            <p>Tu pedido ha sido exitoso. Este es el código de tu pedido con el cual </p>
            <p>Podrás hacer seguimiento a tu pedido: <strong>${order}</strong></p>
            <p>Gracias por hacer parte de nosotros</p>
            <p>Saludos,<br>El equipo de soporte</p>
          </div>
        `;

    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado: " + info.response);
    res.status(200).json({
      message: "Email sended"
    });

  } catch (error) {
    console.error("Error enviando el email:", error);
    return false;
  }
};

const sendSMS = async (code, number) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const sms = require('twilio')(accountSid, authToken);

    sms.messages
      .create({
        body: `Your code is:${code}`,
        messagingServiceSid: 'MG21ac7ec2efbb2450194006eb1a3c683e',
        to: `+57${number}`
      })
    return true
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

const signUp = async (req, res) => {
  let { fullname, email, current_password, number,
    rolId = "681462eaef7752d9d59866d8", ciudadId
  } = req.body;

  if (email) {
    email = email.toLowerCase().trim();
  }

  // Validate null/empty field
  if (!fullname || !email || !current_password || !number || !ciudadId) {
    return res.status(400).json({
      message: "All required fields: fullname, email, password, number y ciudad",
    });
  }
  console.log(ciudadId)
  // Validar ciudad
  const city = await findCityById(ciudadId);
  console.log(city)
  if (!city) {
    return res.status(400).json({
      message: "La ciudad especificada no existe.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[a-zA-Z\d\W]{7,}$/;
  if (!passwordRegex.test(current_password)) {
    return res.status(400).json({
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number and be at least 7 characters long",
    });
  }

  try {
    const existinguser = await prisma.users.findUnique({
      where: { email },
    });
    if (existinguser) {
      return res.status(400).json({
        message: "Email allready registered",
      });
    }
    const hashedPassword = await bcrypt.hash(current_password, 10);
    const verificationCode = await generateVerificationCode();
    const verificationCodeExpires = new Date();
    verificationCodeExpires.setMinutes(verificationCodeExpires.getMinutes() + 15);
    const user = await prisma.users.create({
      data: {
        fullname,
        email,
        current_password: hashedPassword,
        number,
        verificationCode,
        verificationCodeExpires,
        roleId: rolId,
        ciudadId
      },
    });
    // Enviar correo con código de verificación
    const emailSent = await sendEmail(email, verificationCode, fullname, "verification");
    if (!emailSent) {
      // Si falla el envío del correo, eliminamos el usuario creado
      await prisma.users.delete({
        where: { id: user.id },
      });
      return res.status(500).json({
        message: "Failed to send verification email. Please try again later.",
      });
    }
    res.status(201).json({
      message: "User registered succesfully. Please check your email for verification code.",
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    console.log("Error details:", error);
    res.status(500).json({
      message: "User was not created",
      error,
    });
  }
};

const signIn = async (req, res) => {
  let { email, current_password, methodContact } = req.body;
  console.log(req.body);

  if (email) {
    email = email.toLowerCase().trim();
  }

  if (!email || !current_password) {
    return res.status(400).json({
      message: "Both fields are required",
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  try {
    const findUser = await prisma.users.findUnique({
      where: { email },
    });
    console.log(findUser);

    if (!findUser) {
      return res.status(404).json({
        message: "El usuario no existe",
      });
    }
    const validPassword = await bcrypt.compare(current_password, findUser.current_password);


    if (!validPassword) {
      return res.status(400).json({
        message: "Contraseña",
      });
    }

    const newCode = (await generateVerificationCode()).toString();

    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 15);

    await prisma.users.update({
      where: { id: findUser.id },
      data: {
        verificationCode: newCode,
        verificationCodeExpires: expirationTime,
      },
    });

    if (methodContact == "sms") {
      let SMSSended = await sendSMS(newCode, findUser.number);

      if (SMSSended) {
        res.status(200).json({
          message: "Check the SMS code sent to your cell phone",
        });
      }
    } else if (methodContact == "email") {
      const emailSent = await sendEmail(email, newCode, findUser.fullname, "authentication");
      if (emailSent) {
        res.status(200).json({
          message: "Check the code sent to your email",
        });
      }
    } else {
      return res.status(500).json({
        message: "error del server" + error,
      });
    }


  } catch (error) {
    return res.status(500).json({
      message: "error del server" + error,
    });
  }

};

const resendSMS = async (req, res) => {
  let { number } = req.body;

  if (!number) {
    return res.status(400).json({
      message: "The number field are required",
    });
  }

  try {

    const newCode = (await generateVerificationCode()).toString();
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 15);

    await prisma.users.update({
      where: { number },
      data: {
        verificationCode: newCode,
        verificationCodeExpires: expirationTime,
      },
    });

    let SMSSended = await sendSMS(newCode, number);

    if (SMSSended) {
      res.status(200).json({
        message: "Check the SMS code sent to your cell phone again",
      });
    }

  } catch (error) {
    return res.status(500).json({
      message: "error del server" + error,
    });
  }

};

const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      message: "Email and verification code are required",
    });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.status === "ACTIVE") {
      return res.status(400).json({
        message: "User is already verified",
      });
    }

    // Verificar si el código ha expirado
    const now = new Date();
    if (now > user.verificationCodeExpires) {
      return res.status(400).json({
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Verificar si el código es correcto
    if (user.verificationCode !== code) {
      return res.status(400).json({
        message: "Invalid verification code",
      });
    }

    const role = await prisma.role.findUnique({
      where: { id: user.roleId }
    });
    console.log(role)
    const permissionsRole = await prisma.permission.findMany({
      where: {
        id: { in: role.permissionIds },
      },
    });

    console.log(permissionsRole)
    // Actualizar estado del usuario a activo
    await prisma.users.update({
      where: { id: user.id },
      data: {
        status: "ACTIVE",
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    // Generar token de autenticación
    const token = jwt.sign(
      {
        id: user.id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );


    res.status(200).json({
      message: "Account verified successfully",
      token,
      role: role.name,
      permissions: permissionsRole.map(permission => permission.id)
    });

  } catch (error) {
    console.log("Error during verification:", error);
    res.status(500).json({
      message: "Verification failed",
      error: error.message,
    });
  }
};

// Función para reenviar el código de verificación
const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.status === "ACTIVE") {
      return res.status(400).json({
        message: "User is already verified",
      });
    }

    // Generar nuevo código y actualizar fecha de expiración
    const newCode = await generateVerificationCode();
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 15);

    await prisma.users.update({
      where: { id: user.id },
      data: {
        verificationCode: newCode,
        verificationCodeExpires: expirationTime,
      },
    });

    // Enviar nuevo código por correo
    const emailSent = await sendEmail(email, newCode, user.fullname, "authentication");

    if (!emailSent) {
      return res.status(500).json({
        message: "Failed to send verification email. Please try again later.",
      });
    }

    res.status(200).json({
      message: "Verification code sent successfully. Please check your email.",
    });

  } catch (error) {
    console.log("Error resending code:", error);
    res.status(500).json({
      message: "Failed to resend verification code",
      error: error.message,
    });
  }
};

const secondFactorAuthentication = async (req, res) => {
  const { code, email } = req.body;
  if (!code) {
    return res.status(400).json({
      message: "Code is required",
    });
  }
  console.log(code, email);
  try {
    const findUser = await prisma.users.findUnique({
      where: { email },
    });

    const role = await prisma.role.findUnique({
      where: { id: findUser.roleId }
    });
    const permissionsRole = await prisma.permission.findMany({
      where: {
        id: { in: role.permissionIds },
      },
    });


    const now = new Date();
    if (now > findUser.verificationCodeExpires) {
      return res.status(400).json({
        message: "Authenticacion code has expired.",
      });
    }

    if (findUser.verificationCode !== code) {
      return res.status(400).json({
        message: "Invalid authentication code",
      });
    }

    const token = jwt.sign(
      {
        id: findUser.id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    res.status(200).json({
      message: "Login successfull",
      token,
      role: role.name,
      permissions: permissionsRole.map(permission => permission.id)
    });

  } catch (error) {
    res.status(500).json({
      message: "Authentication failed", error: error.message,
    });
  }

}

const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const { id } = req.params;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[a-zA-Z\d\W]{7,}$/;

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number and be at least 7 characters long",
    });
  }

  if (!newPassword) {
    return res.status(400).json({
      message: "A new password is required",
    });
  }

  if (newPassword != confirmNewPassword) {
    return res.status(400).json({
      message: "The new password don't match"
    });
  }

  if (newPassword === currentPassword) {
    return res.status(400).json({
      message: "The new password has to be different"
    });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id },
    });

    const isMatch = await bcrypt.compare(currentPassword, user.current_password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Current password incorrect"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { id: user.id },
      data: {
        current_password: hashedPassword
      },
    });

    res.status(200).json({
      message: "Password changed successfully"
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Change password failed"
    });
  }
};

const verifyPassCode = async (req, res) => {
  let { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      message: "Email and verification code are required",
    });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Verificar si el código ha expirado
    const now = new Date();
    if (now > user.PasswordVerificationCodeExpires) {
      return res.status(400).json({
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Verificar si el código es correcto
    if (user.PasswordVerificationCode !== code) {
      return res.status(400).json({
        message: "Invalid verification code",
      });
    }

    // Actualizar estado del usuario a activo
    await prisma.users.update({
      where: { email: user.email },
      data: {
        passwordStatus: "PENDING",
        PasswordVerificationCode: null,
        PasswordVerificationCodeExpires: null,
      },
    });

    return res.status(200).json({
      message: "Code verified successfully",
    });

  } catch (error) {
    const user = await prisma.users.findUnique({
      where: { email }
    });
    await prisma.users.update({
      where: { email: user.email },
      data: {
        passwordStatus: "VERIFIED",
        PasswordVerificationCode: null,
        PasswordVerificationCodeExpires: null,
      },
    });
    console.log("Error during verification:", error);
    res.status(500).json({
      message: "Verification failed",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  let { email } = req.body;
  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  if (email) {
    email = email.toLowerCase().trim();
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  const user = await prisma.users.findUnique({
    where: { email }
  });
  if (!user) return res.status(404).json({ message: "User not found" });



  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const resetLink = `https://frontend-4cpi.onrender.com/changeResetPassword/${token}`;
  try {
    await sendPassVerificationEmail(user.email, resetLink, user.fullname);

    res.status(200).json({ message: 'Reset email sent' });

  } catch (error) {
    console.log("Error sending link:", error);
    res.status(500).json({
      message: "Failed to send verification link",
      error: error.message,
    });
  }
};

const sendPassVerificationEmail = async (email, code, fullname) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verificación para tu cambio de contraseña",
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
            <h2 style="color: #333; text-align: center;">Verificación de cuenta</h2>
            <p>Hola ${fullname},</p>
            <p>Para el cambio de contraseña utiliza el siguiente enlace de verificacion:</p>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p>Este código expirará en una hora.</p>
            <p>Si no has solicitado este código, por favor ignora este correo.</p>
            <p>Saludos,<br>El equipo de soporte</p>
          </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

const ChangeResetPassword = async (req, res) => {
  const { token, newPassword, confirmNewPassword } = req.body;

  if (!token || !newPassword || !confirmNewPassword) {
    return res.status(400).json({
      message: "Token, new password and confirm new password are required",
    });
  }
  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({
      message: "The new password don't match"
    });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[a-zA-Z\d\W]{7,}$/;

  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number and be at least 7 characters long",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.users.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const password = await bcrypt.hash(newPassword, 10);
    await prisma.users.update(
      { where: { id: user.id }, data: { current_password: password } }
    );

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

// const checkPermission = (url) => {
//   return (req, res, next) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Token no proporcionado" });
//     }

//     const token = authHeader.split(" ")[1];

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const userPermissions = decoded.permissions || [];

//       const method = req.method;

//       // Busca coincidencia exacta
//       if (!userPermissions.includes(url)) {
//         return res.status(403).json({ message: "No tienes permiso para acceder a esta ruta" });
//       }

//       req.user = decoded; // Guardar datos del usuario para la ruta
//       next();
//     } catch (error) {
//       return res.status(401).json({ message: "Token inválido" });
//     }
//   };
// };
const checkPermission = (url, methodExpected) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.users.findUnique({
        where: { id: decoded.id },
      });

      if (!user || user.status !== "ACTIVE") {
        return res.status(401).json({ message: "Unauthorized user" });
      }

      const role = await prisma.role.findUnique({
        where: { id: user.roleId },
      });

      if (!role) {
        return res.status(403).json({ message: "Role not found" });
      }

      const permissions = await prisma.permission.findMany({
        where: {
          id: { in: role.permissionIds },
        },
      });

      const hasPermission = permissions.some(
        (perm) => perm.url === url && perm.method === methodExpected
      );
      console.log(decoded)
      console.log(hasPermission)
      if (!hasPermission) {
        return res.status(403).json({ message: "No tienes permiso para acceder a esta ruta" });
      }

      req.user = decoded; // Guardar usuario
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token inválido" });
    }
  };
};

const getUserFromToken = async (req, res, next) => {
  const token = req.body.token; // <-- FIXED: get token string from body

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
    });

    const role = await prisma.role.findUnique({
      where: { id: user.roleId },
    });

    if (!role) {
      return res.status(403).json({ message: "Rol no encontrado" });
    }

    const permissions = await prisma.permission.findMany({
      where: {
        id: { in: role.permissionIds },
      },
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      telefono: user.number,
      fullname: user.fullname,
      ciudadId: user.ciudadId,
      role: { id: role.id, name: role.name },
      permissions,
    });
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};


module.exports = {
  signUp,
  signIn,
  verifyCode,
  resendVerificationCode,
  secondFactorAuthentication,
  changePassword,
  resendSMS,
  verifyPassCode,
  resetPassword,
  ChangeResetPassword,
  checkPermission,
  sendPassVerificationEmail,
  sendEmail,
  sendEmailStock,
  getUserFromToken,
  sendEmailOrder
};