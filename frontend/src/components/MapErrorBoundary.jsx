import { Component } from 'react'

export default class MapErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="card p-8 text-center" style={{ minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-2xl mb-3">🗺️</div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Map failed to load</p>
          <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-3)' }}>{String(this.state.error.message).slice(0, 120)}</p>
          <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}
            onClick={() => this.setState({ error: null })}>
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
