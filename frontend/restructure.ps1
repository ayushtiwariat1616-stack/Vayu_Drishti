Set-Location 'C:\Projects\frontend\frontend'

$dirs = @(
    'src/app',
    'src/assets/images',
    'src/assets/icons',
    'src/assets/fonts',
    'src/components/layout',
    'src/components/charts',
    'src/components/sensors',
    'src/components/anomalies',
    'src/components/stations',
    'src/components/system',
    'src/components/simulation',
    'src/components/ui',
    'src/pages/CommandCenter',
    'src/pages/LiveMonitor',
    'src/pages/Anomalies',
    'src/pages/Stations',
    'src/pages/Historical',
    'src/pages/Simulation',
    'src/api',
    'src/websocket',
    'src/hooks',
    'src/store',
    'src/mock',
    'src/types',
    'src/utils',
    'src/styles'
)

foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
    }
}

& git mv src/App.css src/styles/animations.css
& git mv src/index.css src/styles/globals.css
& git mv src/App.jsx src/app/App.jsx
& git mv src/components/layout/TopBar.jsx src/components/layout/Header.jsx
& git mv src/components/ui/EventStream.jsx src/components/system/LiveEventStream.jsx
& git mv src/components/utils/time.js src/utils/formatters.js

& git mv src/pages/CommandCenter.jsx src/pages/CommandCenter/CommandCenter.jsx
& git mv src/pages/LiveMonitor.jsx src/pages/LiveMonitor/LiveMonitor.jsx
& git mv src/pages/AnomalyList.jsx src/pages/Anomalies/Anomalies.jsx
& git mv src/pages/AnomalyDetail.jsx src/pages/Anomalies/AnomalyInvestigation.jsx
& git mv src/pages/Stations.jsx src/pages/Stations/Stations.jsx
& git mv src/pages/StationDetail.jsx src/pages/Stations/StationDetail.jsx
& git mv src/pages/HistoricalAnalysis.jsx src/pages/Historical/HistoricalAnalysis.jsx
& git mv src/pages/SimulationLab.jsx src/pages/Simulation/SimulationLab.jsx

# Creating placeholder files to match the requested structure precisely.
$files = @(
    'src/app/routes.jsx',
    'src/app/providers.jsx',
    'src/components/layout/AppShell.jsx',
    'src/components/layout/PageTransition.jsx',
    'src/components/charts/ChartToolbar.jsx',
    'src/components/charts/ChartControls.jsx',
    'src/components/charts/TimeRangeSelector.jsx',
    'src/components/charts/ChartLegend.jsx',
    'src/components/charts/AnomalyMarker.jsx',
    'src/components/sensors/SensorCard.jsx',
    'src/components/sensors/SensorValue.jsx',
    'src/components/sensors/SensorStatus.jsx',
    'src/components/sensors/SensorHealthGauge.jsx',
    'src/components/anomalies/AnomalyCard.jsx',
    'src/components/anomalies/AnomalyTable.jsx',
    'src/components/anomalies/AnomalyBadge.jsx',
    'src/components/anomalies/AnomalyTimeline.jsx',
    'src/components/anomalies/AnomalyScore.jsx',
    'src/components/anomalies/DetectionLayers.jsx',
    'src/components/anomalies/RootCause.jsx',
    'src/components/anomalies/AIExplanation.jsx',
    'src/components/anomalies/CorrectedValue.jsx',
    'src/components/stations/StationCard.jsx',
    'src/components/stations/StationGrid.jsx',
    'src/components/stations/StationStatus.jsx',
    'src/components/stations/StationMetrics.jsx',
    'src/components/system/SystemStatus.jsx',
    'src/components/system/ConnectionStatus.jsx',
    'src/components/simulation/SimulationCard.jsx',
    'src/components/simulation/SimulationPipeline.jsx',
    'src/components/simulation/ReplayControls.jsx',
    'src/components/ui/Button.jsx',
    'src/components/ui/Badge.jsx',
    'src/components/ui/GlassCard.jsx',
    'src/components/ui/Modal.jsx',
    'src/components/ui/Tooltip.jsx',
    'src/components/ui/Skeleton.jsx',
    'src/components/ui/EmptyState.jsx',
    'src/api/stations.api.js',
    'src/api/readings.api.js',
    'src/api/anomalies.api.js',
    'src/api/health.api.js',
    'src/api/simulation.api.js',
    'src/websocket/websocketClient.js',
    'src/websocket/websocketEvents.js',
    'src/websocket/connectionManager.js',
    'src/hooks/useWebSocket.js',
    'src/hooks/useTelemetry.js',
    'src/hooks/useStations.js',
    'src/hooks/useAnomalies.js',
    'src/hooks/useSensorHealth.js',
    'src/hooks/useReplay.js',
    'src/store/telemetryStore.js',
    'src/store/anomalyStore.js',
    'src/store/stationStore.js',
    'src/store/systemStore.js',
    'src/store/uiStore.js',
    'src/types/station.js',
    'src/types/telemetry.js',
    'src/types/anomaly.js',
    'src/types/health.js',
    'src/utils/chartUtils.js',
    'src/utils/anomalyUtils.js',
    'src/utils/sensorUtils.js',
    'src/utils/constants.js',
    'src/styles/theme.css'
)

foreach ($f in $files) {
    if (-not (Test-Path $f)) {
        New-Item -ItemType File -Path $f -Force | Out-Null
        # Write dummy export to avoid Vite import errors if they get imported
        Set-Content -Path $f -Value "export default function Dummy() { return null; }"
    }
}

Write-Host "Structure created."
