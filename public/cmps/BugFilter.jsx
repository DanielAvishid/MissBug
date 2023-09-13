const { useState, useEffect } = React
import { LabelSelector } from './LabelSelector.jsx'

export function BugFilter({ filterBy, onSetFilter }) {

    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)
    const labels = [
        'critical',
        'need-CR',
        'dev-branch',
        'famous',
        'high',
        'save',
        'low',
        'database',
        'shopping-cart',
        'image',
        'font',
        'ux',
        'checkout',
        'login',
        'form',
        'spelling',
        'spacing',
        'button',
        'registration',
        'navigation',
        'link',
        'resource',
    ]

    useEffect(() => {
        onSetFilter(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const field = target.name
        const value = target.type === 'number' ? (+target.value || '') : target.value
        setFilterByToEdit(prevFilterBy => ({ ...prevFilterBy, [field]: value }))
    }

    function onLabelChange(selectedLabels) {
        setFilterByToEdit((prevFilter) => ({
            ...prevFilter,
            labels: selectedLabels,
        }))
    }

    function onSubmitFilter(ev) {
        ev.preventDefault()
        onSetFilter(filterByToEdit)
    }

    const { title, minSeverity, label } = filterByToEdit

    return (
        <section className="bug-filter full main-layout">
            <h2>Filter Our Bugs</h2>
            <form onSubmit={onSubmitFilter}>
                <label htmlFor="title">Title:</label>
                <input value={title} onChange={handleChange} name="title" id="title" type="text" placeholder="By Title" />

                <label htmlFor="minSeverity">Min Severity:</label>
                <input value={minSeverity} onChange={handleChange} type="number" name="minSeverity" id="minSeverity" placeholder="By Min Severity" />

                <LabelSelector labels={labels} onLabelChange={onLabelChange} />
            </form>
        </section>
    )



}