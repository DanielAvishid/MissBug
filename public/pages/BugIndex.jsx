import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'
import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

const { useEffect, useState } = React
const { Link } = ReactRouterDOM

export function BugIndex() {
  const [bugs, setBugs] = useState(null)
  const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
  const [sort, setSort] = useState({ type: '', desc: 1 })
  const [pageCount, setPageCount] = useState(null)

  useEffect(() => {
    loadBugs()
  }, [filterBy, sort])

  function loadBugs() {
    bugService.query(filterBy, sort)
      .then((data) => {
        setBugs(data.bugsToDisplay)
        setPageCount(data.pageCount)
      })
  }

  function onRemoveBug(bugId) {
    bugService.remove(bugId)
      .then(() => {
        const updatedBugs = bugs.filter((bug) => bug._id !== bugId)
        setBugs(updatedBugs)
        showSuccessMsg(`Bug (${bugId}) removed!`)
      })
      .catch((err) => {
        console.log('err:', err)
        showErrorMsg('Problem Removing ' + carId)
      })
  }

  function onSetFilter(filterBy) {
    setFilterBy((prevFilterBy) => ({ ...prevFilterBy, ...filterBy }))
  }

  function onChangePageIdx(diff) {
    const nextPageIdx = filterBy.pageIdx + diff
    if (nextPageIdx === pageCount) {
      setFilterBy(prevFilterBy => ({ ...prevFilterBy, pageIdx: 0 }))
    } else if (nextPageIdx === -1) {
      console.log(filterBy.pageIdx)
      setFilterBy(prevFilterBy => ({ ...prevFilterBy, pageIdx: pageCount - 1 }))
    } else setFilterBy(prevFilterBy => ({ ...prevFilterBy, pageIdx: nextPageIdx }))
  }

  function onExportToPdf() {
    bugService.exportToPdf()
  }

  if (!bugs) return <div>Loading...</div>
  return (
    <section className="bug-index full main-layout">
      <BugFilter
        onSetFilter={onSetFilter}
        filterBy={filterBy} />
      <div className="action-btns flex justify-center align-center">
        <Link to="/bug/edit">Add Bug</Link>
        <button className="btn-pdf" onClick={onExportToPdf}>
          Download PDF
        </button>
      </div>
      <BugList
        bugs={bugs}
        onRemoveBug={onRemoveBug}
        sort={sort}
        setSort={setSort} />
      <section>
        <button onClick={() => onChangePageIdx(-1)}>Prev</button>
        <span>{filterBy.pageIdx + 1}</span>
        <button onClick={() => onChangePageIdx(1)}>Next</button>
      </section>
    </section>
  )
}

