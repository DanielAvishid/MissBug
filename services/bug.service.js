
import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export const bugService = {
    query,
    getById,
    remove,
    save
}

const bugs = utilService.readJsonFile('data/bug.json')
const PAGE_SIZE = 3

function query(filterBy = {}, sortBy) {
    let bugsToDisplay = [...bugs]
    if (filterBy.title) {
        const regExp = new RegExp(filterBy.title, 'i')
        bugsToDisplay = bugsToDisplay.filter(
            (bug) => regExp.test(bug.title) || regExp.test(bug.description)
        )
    }
    if (filterBy.minSeverity) {
        bugsToDisplay = bugsToDisplay.filter(
            (bug) => bug.severity >= filterBy.minSeverity
        )
    }
    if (filterBy.labels) {
        const labelsToFilter = filterBy.labels
        bugsToDisplay = bugsToDisplay.filter((bug) =>
            labelsToFilter.every((label) => bug.labels.includes(label))
        )
    }

    const pageCount = Math.ceil(bugsToDisplay.length / PAGE_SIZE)
    bugsToDisplay = getSortedBugs(bugsToDisplay, sortBy)

    if (filterBy.pageIdx !== undefined) {
        let startIdx = filterBy.pageIdx * PAGE_SIZE
        bugsToDisplay = bugsToDisplay.slice(startIdx, startIdx + PAGE_SIZE)
    }

    const data = { bugsToDisplay, pageCount }
    return Promise.resolve(data)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Bug not found!')
    return Promise.resolve(bug)
}

function remove(bugId) {
    const idx = bugs.findIndex(bug => bug._id === bugId)
    bugs.splice(idx, 1)
    return _saveBugsToFile()
}

function save(bug) {
    if (bug._id) {
        const bugToUpdate = bugs.find((currBug) => currBug._id === bug._id)
        bugToUpdate.title = bug.title
        bugToUpdate.severity = bug.severity
        bugToUpdate.description = bug.description
        bugToUpdate.labels = bug.labels
    } else {
        bug._id = utilService.makeId()
        bug.createdAt = Date.now()
        bugs.unshift(bug)
    }
    return _saveBugsToFile().then(() => bug)
}

function getSortedBugs(bugsToDisplay, sortBy) {
    bugsToDisplay.sort(
        (b1, b2) => sortBy.desc * (b2[sortBy.type] - b1[sortBy.type])
    )
    return bugsToDisplay
}

function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 2)
        fs.writeFile('data/bug.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to bugs file', err)
                return reject(err);
            }
            console.log('The file was saved!')
            resolve()
        })
    })
}

