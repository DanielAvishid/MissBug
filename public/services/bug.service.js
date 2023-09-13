const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    get,
    remove,
    save,
    getEmptyBug,
    getDefaultFilter,
    exportToPdf
}

function query(filterBy = getDefaultFilter(), sortBy = { type: 'severity', desc: 1 }) {
    const filterSortBy = { ...filterBy, ...sortBy }
    return axios.get(BASE_URL, { params: filterSortBy }).then(res => res.data)
}

function get(bugId) {
    return axios.get(BASE_URL + bugId).then(res => res.data)
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId).then(res => res.data)
}

function save(bug) {
    const method = bug._id ? 'put' : 'post'
    return axios[method](BASE_URL + 'save', bug).then(res => res.data)
}


function exportToPdf() {
    return axios.get(BASE_URL + 'export', { responseType: 'blob' }).then((res) => {
        // Create a Blob from the response data
        const blob = new Blob([res.data], { type: 'application/pdf' })

        // Create a temporary URL for the Blob
        const url = window.URL.createObjectURL(blob)

        // Create a link element to trigger the download
        const a = document.createElement('a')
        a.href = url
        a.download = 'SaveTheBugs.pdf'
        a.click()

        // Release the object URL when done
        window.URL.revokeObjectURL(url)
    })
}

function getEmptyBug(title = '', severity = '', description = '') {
    return { _id: '', title, severity, description, createdAt: Date.now() }
}

function getDefaultFilter() {
    return { title: '', minSeverity: '', labels: '', pageIdx: 0 }
}

