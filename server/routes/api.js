const express = require('express')
const moment = require('moment')
const router = express.Router()

const Expense = require('../model/Expense')

// router.get('/Expenses', function (req, res) {
//     Expense.find({}).sort({ date: -1 }).then(function (Expenses) {
//         res.send(Expenses)
//     })
// })

// router.get('/Expenses/:group', function (req, res) {
//     Expense.find({
//         group : req.params.group
//     }).then(function (Expenses) {
//         res.send(Expenses)
//     })
// })

router.get('/expenses/:group', async (req, res) => {
    const { group } = req.params
    const { total } = req.query

    if (total === 'true') {
        try {
            const aggregatedTotal = await Expense.aggregate([
                { $match: { group: group } }, 
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' } 
                    }
                }
            ])

            if (aggregatedTotal.length > 0) {
                res.json({ totalAmount: aggregatedTotal[0].totalAmount })
            } else {
                res.status(404).json({ message: 'No expenses found for the given group' })
            }
        } catch (err) {
            res.status(500).json({ message: 'Error retrieving total amount', error: err })
        }
    } else {
        try {
            const expenses = await Expense.find({ group: group })
            res.json(expenses)
        } catch (err) {
            res.status(500).json({ message: 'Error retrieving expenses', error: err })
        }
    }
})

router.get('/expenses', async (req, res) => {
    const { d1, d2 } = req.query;
    let query = {};
    if (d1 && d2) {
        query.date = { $gte: moment(d1, 'YYYY-MM-DD').toDate(), $lte: moment(d2, 'YYYY-MM-DD').toDate() }
    } else if (d1) {
        query.date = { $gte: moment(d1, 'YYYY-MM-DD').toDate(), $lte: moment().toDate() }
    }
    try {
        const expenses = await Expense.find(query)
        res.json(expenses)
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving expenses', error: err })
    }
})

router.post('/expense', function (req, res) {
    const { item, amount, group, date } = req.body

    const expenseDate = date ? moment(date, 'YYYY-MM-DD').format('LLLL') : moment().format('LLLL')

    const newExpense = new Expense({
        item,
        amount,
        group,
        date: expenseDate
    })

    newExpense.save()
        .then((savedExpense) => {
            console.log(`Expense of ${savedExpense.amount} on ${savedExpense.item} saved successfully.`)
            res.status(201).json(savedExpense)
        })
        .catch((err) => {
            console.error('Error saving expense:', err)
            res.status(500).send('Error saving expense')
        })
})

router.put('/update/:group1/:group2', async function (req, res) {
    const { group1, group2 } = req.params

    try {
        const expense = await Expense.findOneAndUpdate({ group: group1 }, { $set: { group: group2 } }, { new: true })

        if (!expense) {
            return res.status(404).send(`No expense found for group ${group1}`)
        }

        return res.send(`Expense ${expense.item} group changed to ${group2}`)
    } catch (err) {
        console.error('Error updating expense:', err)
        return res.status(500).send('Error updating expense')
    }
})




module.exports = router