"""
Enhanced Dashboard Routes
Updated API endpoints for comprehensive dashboard data

File: backend/app/api/routes/dashboard_enhanced.py
Updated: 2025-04-08
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.dashboard_service import DashboardService
from app.core.security import get_current_user
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get("/overview")
async def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get basic dashboard overview
    
    Returns:
        - overview: Basic asset metrics
        - by_type: Asset distribution by type
        - by_status: Asset distribution by status
        - timestamp: Response timestamp
    
    Response time: < 500ms
    """
    try:
        service = DashboardService(db)
        
        # Only return basic data for faster performance
        basic_overview = {
            "overview": service._get_asset_overview(),
            "by_type": service._get_assets_by_type(),
            "by_status": service._get_assets_by_status(),
        }
        
        return {"data": basic_overview}
    
    except Exception as e:
        logger.error(f"Dashboard overview error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve dashboard overview"
        )


@router.get("/enhanced")
async def get_enhanced_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive enhanced dashboard with all metrics
    
    This endpoint returns:
    - Asset overview (count, value, averages)
    - Maintenance statistics (active tasks, costs, trends)
    - Inventory statistics (stock levels, alerts)
    - Fleet statistics (vehicle status, mileage, fuel)
    - Sensor statistics (critical alerts, warnings)
    - Recent activities (last 5 maintenance tasks)
    - Low stock alerts (inventory items to reorder)
    - Chart data (trends, distributions)
    
    Response time: 1-2 seconds
    Caching: Recommended every 30 seconds
    """
    try:
        service = DashboardService(db)
        dashboard_data = service.get_enhanced_dashboard_overview()
        
        return {
            "data": dashboard_data,
            "status": "success",
            "cached": False,
        }
    
    except Exception as e:
        logger.error(f"Enhanced dashboard error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve enhanced dashboard data"
        )


@router.get("/metrics/maintenance")
async def get_maintenance_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed maintenance statistics"""
    try:
        service = DashboardService(db)
        return {"data": service._get_maintenance_stats()}
    except Exception as e:
        logger.error(f"Maintenance metrics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve maintenance metrics")


@router.get("/metrics/inventory")
async def get_inventory_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed inventory statistics"""
    try:
        service = DashboardService(db)
        return {"data": service._get_inventory_stats()}
    except Exception as e:
        logger.error(f"Inventory metrics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve inventory metrics")


@router.get("/metrics/fleet")
async def get_fleet_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed fleet statistics"""
    try:
        service = DashboardService(db)
        return {"data": service._get_fleet_stats()}
    except Exception as e:
        logger.error(f"Fleet metrics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve fleet metrics")


@router.get("/metrics/sensors")
async def get_sensor_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed sensor statistics and alerts"""
    try:
        service = DashboardService(db)
        return {"data": service._get_sensor_stats()}
    except Exception as e:
        logger.error(f"Sensor metrics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve sensor metrics")


@router.get("/charts/maintenance-trend")
async def get_maintenance_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get maintenance cost trend for charts"""
    try:
        service = DashboardService(db)
        trend = service._get_maintenance_trend()
        return {"data": trend}
    except Exception as e:
        logger.error(f"Maintenance trend error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve trend data")


@router.get("/alerts/critical")
async def get_critical_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all critical system alerts"""
    try:
        service = DashboardService(db)
        alerts = service._get_critical_alerts()
        return {"data": alerts}
    except Exception as e:
        logger.error(f"Critical alerts error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve critical alerts")


@router.get("/activities/recent")
async def get_recent_activities(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recent maintenance activities"""
    try:
        service = DashboardService(db)
        activities = service._get_recent_activities(limit=limit)
        return {"data": activities}
    except Exception as e:
        logger.error(f"Recent activities error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve recent activities")


@router.get("/alerts/low-stock")
async def get_low_stock_alerts(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get inventory items below stock level"""
    try:
        service = DashboardService(db)
        alerts = service._get_low_stock_alerts(limit=limit)
        return {"data": alerts}
    except Exception as e:
        logger.error(f"Low stock alerts error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve low stock alerts")


# Additional utility endpoints

@router.get("/health")
async def dashboard_health(db: Session = Depends(get_db)):
    """
    Check dashboard service health
    
    Returns health status and basic metrics without auth
    """
    try:
        service = DashboardService(db)
        overview = service._get_asset_overview()
        
        return {
            "status": "healthy",
            "assets": overview["total_assets"],
            "timestamp": None,  # Add current timestamp
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
        }, 500


@router.get("/export/pdf")
async def export_dashboard_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Export dashboard as PDF
    
    Note: Requires python-pptx or similar library for implementation
    """
    return {
        "message": "PDF export feature coming soon",
        "status": "not_implemented"
    }


@router.post("/refresh")
async def manual_refresh(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manually trigger dashboard data refresh
    
    Useful for real-time updates without waiting for auto-refresh
    """
    try:
        service = DashboardService(db)
        dashboard_data = service.get_enhanced_dashboard_overview()
        
        return {
            "status": "refreshed",
            "data": dashboard_data,
        }
    except Exception as e:
        logger.error(f"Manual refresh error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to refresh dashboard")
