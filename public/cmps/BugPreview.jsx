export function BugPreview({ bug }) {
  return (
    <article className="bug-preview">
      <h2>Bug Title: {bug.title}</h2>
      <h1>🐛</h1>
      <h4>Description: {bug.description}</h4>
      <h4>Severity: {bug.severity}</h4>
      {bug.owner && <h4>Owner: {bug.owner.fullname}</h4>}
      {bug.labels.map(l => <p key={l}>{l}</p>)}
    </article>
  )
}
