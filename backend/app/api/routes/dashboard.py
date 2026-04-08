"""
Dashboard Routes

Dashboard and statistics endpoints.
"""

from fastapi import APIRouter, Depends

from app.services.asset_service import AssetService
from app.api.deps import get_current_user, get_asset_service

router = APIRouter()


@router.get("/overview", summary="Dashboard overview")
def get_dashboard_overview(
    asset_service: AssetService = Depends(get_asset_service),
    current_user=Depends(get_current_user),
):
    """
    Get dashboard overview with key statistics.

    Returns:
    - **total_assets**: Total number of assets
    - **by_type**: Asset count grouped by type
    - **by_status**: Asset count grouped by status
    - **total_value**: Total value of all assets
    """
    stats = asset_service.get_asset_statistics()

    return {
        "overview": {
            "total_assets": stats["total_assets"],
            "total_value": float(stats["total_value"]),
        },
        "by_type": stats["by_type"],
        "by_status": stats["by_status"],
        "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
    }
