const attendanceModel = require('../models/index').attendance
const userModel = require('../models/index').users
const { Op, fn, col, literal, where, Model } = require('sequelize')
const moment = require('moment')
const { date } = require('joi')
const attendance = require('../models/attendance')

exports.addAttendance = (req, res) => {
    let newAttendance = {
        user_id: req.body.user_id,
        date: req.body.date,
        time: req.body.time,
        status: req.body.status
    }

    attendanceModel.create(newAttendance).then(result => {
        let attendanceData = {
            attendance_id: result.id,
            user_id: result.user_id,
            date: moment(result.date).format('YYYY-MM-DD'),
            time: result.time,
            status: result.status
        }
        return res.json({
            status: 'success',
            message: 'Presensi berhasil dicatat',
            data: attendanceData
        })
    })
    .catch(error => {
        return res.status(500).json({
            success: false,
            message: 'Error recording attendance: ${error.message}'
        })
    })
}

exports.getAttendanceById = async (req, res) => {
    const { user_id } = req.params

    attendanceModel.findAll({ where: { user_id: user_id } }).then(attendanceData => {
        if (attendanceData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No attendance records found for User ID ${user_id}'
            })
        }
        const formattedData = attendanceData.map(item => ({
            attendance_id: item.id,
            date: moment(item.date).format('YYYY-MM-DD'),
            time: item.time,
            status: item.status
        }))

        return res.json({
            status: 'success',
            data: formattedData
        })
    })
    .catch(error => {
        return res.status(500).json({
            success: false,
            message: 'Error retrieving attendance: ${error.message}'
        })
    })
}

exports.getMonthlyAttendanceSummary = (req, res) => {
    const { user_id } = req.params
    const year = req.query.year || moment().format('YYYY')
    const month = req.query.month || moment().format('MM')
    const formattedMonth = month.toString().padStart(2, '0')

    attendanceModel.findAll({
        where: {
            user_id: user_id,
            date: {
                [Op.between]: ['${year}-${formattedMonth}-01, ${year}-${formattedMonth}-31'],
            }
        },
        attributes: [
            [fn('MONTH', col('date')), 'month'],
            [fn('YEAR', col('date')), 'year'],
            [fn('COUNT', col('status')), 'total'],
            [literal("SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END)"), 'hadir'],
            [literal("SUM(CASE WHEN status = 'izin' THEN 1 ELSE 0 END)"), 'izin'],
            [literal("SUM(CASE WHEN status = 'sakit' THEN 1 ELSE 0 END)"), 'sakit'],
            [literal("SUM(CASE WHEN status = 'alpha' THEN 1 ELSE 0 END)"), 'alpha']
        ],
        group: ['year', 'month'],
        raw: true
    })
    .then((data) => {
        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No attendance records found for user ID ${user_id} in ${year}-${formattedMonth}'
            })
        }
        const summary = {
            user_id: user_id,
            month: '${formattedMonth}-${year}',
            attendanceSummary: {
                hadir: data[0].hadir,
                izin: data[0].izin,
                sakit: data[0].sakit,   
                alpha: data[0].alpha
            }
        }

        return res.json({
            status: 'success',
            data: summary
        })
    })
    .catch((error) => {
        return res.status(500).json({
            success: false,
            message: 'Error retrieving monthly attendance summary: ${error.message}'
        })
    })  
}

exports.analyzeAttendance = (req, res) => {
    const { start_date, end_date, group_by } = req.body

    if (!start_date || !end_date || !group_by) {
        return res.status(400).json({
            success: false,
            message: 'Missing required parameters: start_date, end_date, or group_by.'
        })
    }

    attendanceModel.findAll({
        where: {
            date: {
                [Op.between]: [start_date, end_date]
            },
        },
        include: [{
            model: userModel,
            attributes: ['role'],
        }],
        attributes: [
            [col('user.role'), 'group'],
            [fn('COUNT', col('user_id')), 'total_users'],
            [literal("SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END)"), 'hadir'],
            [literal("SUM(CASE WHEN status = 'izin' THEN 1 ELSE 0 END)"), 'izin'],
            [literal("SUM(CASE WHEN status = 'sakit' THEN 1 ELSE 0 END)"), 'sakit'],
            [literal("SUM(CASE WHEN status = 'alpha' THEN 1 ELSE 0 END)"), 'alpha'],
            [literal('COUNT(*)'), 'total_records']
        ],
        group: [col('user.role')],
        raw: true
    })
    .then(data => {
        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No attendance records found for the given period and parameters.'
            })
        }

        const groupedAnalysis = data.map(item => {
            const totalRecords = parseInt(item.total_records, 10)
            return {
                group: item.group,
                total_users: parseInt(item.total_users, 10),
                attendance_rate: {
                    hadir_percentage: (parseInt(item.hadir_count, 10) / totalRecords * 100).toFixed(2),
                    izin_percentage: (parseInt(item.izin_count, 10) / totalRecords * 100).toFixed(2),
                    sakit_percentage: (parseInt(item.sakit_count, 10) / totalRecords * 100).toFixed(2),
                    alpha_percentage: (parseInt(item.alpha_count, 10) / totalRecords * 100).toFixed(2)
                },
                total_attendance: {
                    hadir: parseInt(item.hadir_count, 10),
                    izin: parseInt(item.izin_count, 10),
                    sakit: parseInt(item.sakit_count, 10),
                    alpha: parseInt(item.alpha_count, 10)
                }
            }
        })

        return res.json({
            status: 'success',
            data: {
                analysis_period: {
                    start_date,
                    end_date
                },
                grouped_analysis: groupedAnalysis
            }
        })
    })
    .catch(error => {
        return res.status(500).json({
            success: false,
            message: 'Error analyzing attendance: ${error.message}'
        })
    })
}