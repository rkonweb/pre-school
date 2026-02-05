export default function HealthCheck() {
    return (
        <div style={{ padding: 20 }}>
            <h1>System Status: Online 🟢</h1>
            <p>Deployment ID: {new Date().toISOString()}</p>
            <p>Version: Refreshing Summer Fun Fix</p>
        </div>
    )
}
