import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { pdfService } from './services/pdf.service.js'
import { userService } from './services/user.service.js'
import path from 'path'

const app = express()

// App Configuration
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// Get Bugs (READ)
app.get('/api/bug', (req, res) => {
    const { title, minSeverity, pageIdx, labels, type, desc } = req.query
    const filterBy = { title, minSeverity, labels, pageIdx }
    const sortBy = { type, desc }
    bugService.query(filterBy, sortBy).then((data) => {
        res.send(data)
    })
})

// Save Bug (CREATE)
app.post('/api/bug', (req, res) => {
    const { title, severity, description, labels } = req.body
    const bug = {
        title,
        severity: +severity,
        description,
        labels,
    }
    bugService
        .save(bug)
        .then((savedBug) => res.send(savedBug))
        .catch((err) => console.log(err))
})

// Save Bug (UPDATE)
app.put('/api/bug', (req, res) => {
    const { _id, title, severity, description, createdAt, labels } = req.body
    const bug = {
        _id,
        title,
        severity: +severity,
        description,
        createdAt,
        labels,
    }
    bugService
        .save(bug)
        .then((savedBug) => res.send(savedBug))
        .catch((err) => console.log(err))
})

//Pdf bonus
app.get('/api/bug/export', (req, res) => {

    bugService.query().then(pdfService.buildPDF).then((pdfFileName) => {
        const pdfFilePath = path.join(process.cwd(), pdfFileName)
        // Send the PDF file to the client
        return res.sendFile(pdfFilePath) //SaveTheBugs.pdf
    }).catch(err => {
        loggerService.error('Cannot get Pdf', err)
        res.status(400).send('Cannot get Pdf')
    })
})

// Get Bug (READ)
app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    bugService
        .get(bugId)
        .then((bug) => {
            let visitedBugsIds = req.cookies.visitedBugsIds || []
            const bugExist = visitedBugsIds.find((id) => id === bugId)
            if (!bugExist) {
                if (visitedBugsIds.length < 3) {
                    visitedBugsIds.push(bugId)
                } else return res.status(401).send('Wait for a bit')
            }
            res.cookie('visitedBugsIds', visitedBugsIds, { maxAge: 1000 * 7 })
            res.send(bug)
        })
        .catch((err) => res.status(403).send(err))
})

// Remove Bug (Delete)
app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params.bugId

    bugService.remove(bugId)
        .then(() => {
            loggerService.info(`Bug ${bugId} removed`)
            res.send('Bug removed successfully!')
        }).catch(err => {
            loggerService.error('Cannot get bug', err)
            res.status(400).send('Cannot get bug')
        })
})

// Get Users (READ)
app.get('/api/user', (req, res) => {

    userService.query()
        .then(users => {
            res.send(users)
        })
        .catch(err => {
            loggerService.error('Cannot get users', err)
            res.status(400).send('Cannot get users')
        })
})

// Get Users (READ)
app.get('/api/user/:userId', (req, res) => {

    const { userId } = req.params

    userService.getById(userId)
        .then(user => {
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot get user', err)
            res.status(400).send('Cannot get user')
        })
})

app.post('/api/auth/login', (req, res) => {
    const credentials = req.body
    userService.checkLogin(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(401).send('Invalid Credentials')
            }
        })
})



app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    userService.add(credentials)
        .then(user => {
            const loginToken = userService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot signup', err)
            res.status(400).send('Cannot signup')
        })
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('Loggedout..')
})

const PORT = 3030
app.listen(PORT, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)