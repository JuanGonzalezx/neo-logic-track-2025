const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.users.findMany();
        res.status(200).json(users);
    } catch (error) {
        console.error("error fetching users",error);
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error del server", error: error.message, });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.users.findUnique({
            where: { id },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("error fetching user", error);
        res.status(500).json({ message: "Error del server", error: error.message, });
    }
};

const getUserByEmail = async (req, res) => {  
  const { email } = req.params;
  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
      }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({ message: "Error del server", error: error.message });
  }
}

const createUser = async (req, res) => {
    let { fullname, email, current_password, number, roleId, status = "PENDING" } = req.body;
  
    if (email) email = email.toLowerCase().trim();
  
    if (!fullname || !email || !current_password || !number) {
      return res.status(400).json({
        message: "All required fields: fullname, email, password and number",
      });
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
  
    if (!/^(\+?57)?3\d{9}$/.test(number)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }
  
    if (current_password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
  
    try {
      const existingEmail = await prisma.users.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
  
      const existingNumber = await prisma.users.findUnique({ where: { number } });
      if (existingNumber) {
        return res.status(400).json({ message: "Phone number already registered" });
      }
  
      const hashedPassword = await bcrypt.hash(current_password, 10);
  
      const user = await prisma.users.create({
        data: {
          fullname,
          email,
          current_password: hashedPassword,
          number,
          roleId,
          status
        },
      });
      res.status(201).json({ message: "User created successfully", userId: user.id, email: user.email });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "User was not created", error: error.message });
    }
  };
  
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, number, current_password, fullname, rolId, status } = req.body;
    const updateData = {};
  
    if (email) {
      const emailFormatted = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailFormatted)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      const existingEmail = await prisma.users.findUnique({ where: { email: emailFormatted } });
      if (existingEmail && existingEmail.id !== id) {
        return res.status(400).json({ message: "Email already in use" });
      }
      updateData.email = emailFormatted;
    }
  
    if (number) {
      if (!/^(\+?57)?3\d{9}$/.test(number)) {
        return res.status(400).json({ message: "Invalid phone number format" });
      }
      const existingNumber = await prisma.users.findUnique({ where: { number } });
      if (existingNumber && existingNumber.id !== id) {
        return res.status(400).json({ message: "Phone number already in use" });
      }
      updateData.number = number;
    }
  
    if (current_password) {
      if (current_password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      updateData.current_password = await bcrypt.hash(current_password, 10);
    }
  
    if (fullname) updateData.fullname = fullname;
    if (rolId) updateData.rolId = rolId;
    if (status) updateData.status = status;
  
    try {
      const updatedUser = await prisma.users.update({
        where: { id },
        data: updateData,
      });
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user", error: error.message });
    }
  };
  

// Eliminar usuario
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.users.delete({
            where: { id }
        });

        res.status(200).json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ message: "Error del servidor", error: error.message });
    }
};

module.exports = { getAllUsers, getUserById,getUserByEmail, updateUser, createUser, deleteUser };