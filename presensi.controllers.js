const modelUser = require('../models/index').user;
const modelpresensi = require('../models/index').presensi;
const { date } = require('joi');
const { Op, where } = require('sequelize');
const presensi = require('../models/presensi');

// Helper untuk format tanggal
const formattedDate = (date) => {
    let today = new Date(date);
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
};

// Helper untuk format waktu
const formattedTime = (date) => {
    let today = new Date(date);
    let hh = String(today.getHours()).padStart(2, '0');
    let mm = String(today.getMinutes()).padStart(2, '0');
    let ss = String(today.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
};

exports.Presensi = async (request, response) => {
    try {
        const validStatus = ["HADIR", "IZIN", "SAKIT", "ALPHA"];
        const { id_presensi, status } = request.body;
        

        if (!validStatus.includes(status.toUpperCase())) {
            return response.status(400).json({
                success: false,
                message: "Status tidak valid (harus HADIR, IZIN, SAKIT, atau ALPHA)"
            });
        }

        const dataUser = {
            id_presensi: id_presensi,
            date: formattedDate(new Date()),
            time: formattedTime(new Date()),
            status: status.toUpperCase(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await modelpresensi.create(dataUser);
        return response.status(200).json({
            success: true,
            data: result,
            message: "Presensi berhasil"
        });
    } catch (error) {
        return response.status(500).json({
            success: false,
            error: error.message,
            message: "Presensi gagal"
        });
    }
};

exports.getPresensiById = async (request, response) => {
    try {
        const { id } = request.params;
        const presensi = await modelpresensi.findOne({
            where: {
                iduser: id
            }
        });
        return response.json({
            status: 'succes',
            data: {
                id: presensi.iduser,
                date: presensi.date,
                time: presensi.time,
                status: presensi.status
            }
        });
    } catch (error) {
        return response.status(500).json({
            success: false,
            error: error.message,
            message: "Gagal memuat presensi"
        });
        console.log(error)
    }
};

exports.findPresensi = async (request, response) => {
try {
    const userPresensi = await modelpresensi.findAll()

    if (!userPresensi){
        return response.status(404).json({
            success: false,
            message: `gak ketemu bosku`
        })
    }

    return response.json({
        status: 'succes',
        data: userPresensi
    })
} catch (error) {
    console.log(error)
}
};

exports.Summary = async (request, response) => {
    try {
        const { iduser } = request.params;

        const presensi = await modelpresensi.findAll({
            where: { id_presensi: id_presensi }
        });

        if (presensi.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Tidak ada data presensi untuk pengguna ini"
            });
        }

        let hadir = 0, izin = 0, sakit = 0, alpha = 0;
        presensi.forEach(p => {
            switch (p.status.toUpperCase()) {
                case "HADIR": hadir++; break;
                case "IZIN": izin++; break;
                case "SAKIT": sakit++; break;
                case "ALPHA": alpha++; break;
            }
        });

        const month = formattedDate(presensi[0].date).slice(0, 7);

        return response.status(200).json({
            status: "success",
            data: {
                idpresensi: idpresensi,
                month,
                attendance_summary: { hadir, izin, sakit, alpha }
            }
        });
    } catch (error) {
        return response.status(500).json({
            success: false,
            error: error.message,
            message: "Gagal menghitung summary"
        });
    }
};

exports.Analysis = async (request, response) => {
    try {
        let startDate = new Date(request.body.startDate);
        let endDate = new Date(request.body.endDate);
        let role = request.body.role;

        startDate.setDate(startDate.getDate() + 1);
        endDate.setDate(endDate.getDate() + 1);

        const presensi = await modelpresensi.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [{
                model: modelUser,
                where: {
                    role: role
                }
            }]
        });

        return response.status(200).json({
            success: true,
            data: presensi,
            message: "Data presensi berhasil dimuat"
        });
    } catch (error) {
        return response.status(500).json({
            success: false,
            error: error.message,
            message: "Gagal memuat data presensi"
        });
    }
};