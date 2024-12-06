const userModel = require('../models/index').User;
const Op = require('sequelize').Op;

// Mengambil semua pengguna
exports.getAllUser = async (request, response) => {
    try {
        let users = await userModel.findAll();
        // Menghapus createdAt dan updatedAt dari hasil
        users = users.map(user => {
            delete user.createdAt;
            delete user.updatedAt;
            return user;
        });

        return response.json({
            success: true,
            message: 'All users have been loaded',
            data: users
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};

// Mencari pengguna berdasarkan keyword
exports.findUser = async (request, response) => {
    try {
        let keyword = request.body.keyword;
        let users = await userModel.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.substring]: keyword } },
                    { username: { [Op.substring]: keyword } },
                    { password: { [Op.substring]: keyword } },
                    { role: { [Op.substring]: keyword } },
                    { id: { [Op.substring]: keyword } }
                ]
            }
        });

        return response.json({
            success: true,
            data: users,
            message: 'All users have been loaded'
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};

// Menambahkan pengguna baru
exports.addUser = async (request, response) => {
    try {
        let { nama, username, password, role } = request.body;
        // Hash password jika perlu (misalnya menggunakan bcrypt)
        let hashedPassword = password; // Gantilah ini jika Anda ingin menggunakan bcrypt atau hashing lainnya

        // Membuat pengguna baru
        let newUser = {
            name: nama,
            username: username,
            password: hashedPassword,
            role: role,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        let user = await userModel.create(newUser);

        return response.json({
            success: true,
            message: 'New user has been inserted',
            data: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};

// Mengupdate pengguna berdasarkan ID
exports.updateUser = async (request, response) => {
    try {
        let idUser = request.params.id;
        let { name, username, password, role } = request.body;
        
        let dataUser = {
            name: name,
            username: username,
            password: password,
            role: role
        };

        await userModel.update(dataUser, { where: { id: idUser } });

        return response.json({
            success: true,
            message: 'Pengguna berhasil diubah',
            data: {
                id: idUser,
                name: dataUser.name,
                username: dataUser.username,
                role: dataUser.role
            }
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};

// Menghapus pengguna berdasarkan ID
exports.deleteUser = async (request, response) => {
    try {
        let idUser = request.params.id;
        await userModel.destroy({ where: { id: idUser } });

        return response.json({
            success: true,
            message: 'Data user has been deleted'
        });
    } catch (error) {
        return response.json({
            success: false,
            message: error.message
        });
    }
};
