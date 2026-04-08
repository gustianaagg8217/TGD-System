"""
Enhanced Dashboard Service
Provides comprehensive dashboard statistics and metrics for the TGd System

File: backend/app/services/dashboard_service.py
Author: TGd System Dev Team
Created: 2025-04-08
"""

from datetime import datetime, timedelta
from sqlalchemy import func
from decimal import Decimal
from app.db.session import SessionLocal
from app.models.asset import Asset
from app.models.maintenance import MaintenanceLog
from app.models.inventory import InventoryItem
from app.models.vehicle import Vehicle, VehicleUsageLog
from app.models.sensor import SensorLog
from app.core.constants import (
    AssetStatusEnum,
    MaintenanceStatusEnum,
    SensorStatusEnum,
    VehicleTypeEnum,
)


class DashboardService:
    """Service for aggregating dashboard data and metrics"""

    def __init__(self, db: SessionLocal = None):
        self.db = db or SessionLocal()

    def get_enhanced_dashboard_overview(self) -> dict:
        """
        Get comprehensive dashboard overview with all metrics
        
        Returns:
            dict: Complete dashboard data with all sections
        """
        return {
            "overview": self._get_asset_overview(),
            "maintenance": self._get_maintenance_stats(),
            "inventory": self._get_inventory_stats(),
            "fleet": self._get_fleet_stats(),
            "sensors": self._get_sensor_stats(),
            "by_type": self._get_assets_by_type(),
            "by_status": self._get_assets_by_status(),
            "charts": self._get_chart_data(),
            "recent_activities": self._get_recent_activities(),
            "low_stock_alerts": self._get_low_stock_alerts(),
            "critical_alerts": self._get_critical_alerts(),
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _get_asset_overview(self) -> dict:
        """Get basic asset overview metrics"""
        total_assets = self.db.query(func.count(Asset.id)).filter(
            Asset.is_deleted == False
        ).scalar()
        
        total_value = self.db.query(func.sum(Asset.value)).filter(
            Asset.is_deleted == False
        ).scalar() or Decimal(0)
        
        return {
            "total_assets": total_assets or 0,
            "total_value": float(total_value),
            "avg_value": float(total_value / total_assets) if total_assets else 0,
        }

    def _get_maintenance_stats(self) -> dict:
        """Get maintenance-related statistics"""
        # Active maintenance tasks
        active_tasks = self.db.query(func.count(MaintenanceLog.id)).filter(
            MaintenanceLog.status.in_(['scheduled', 'in_progress'])
        ).scalar() or 0

        # Maintenance cost this month
        first_day = datetime.now().replace(day=1)
        monthly_cost = self.db.query(func.sum(MaintenanceLog.cost)).filter(
            MaintenanceLog.date >= first_day,
            MaintenanceLog.date < datetime.now(),
        ).scalar() or Decimal(0)

        # Average cost per maintenance
        avg_cost = self.db.query(func.avg(MaintenanceLog.cost)).filter(
            MaintenanceLog.cost.isnot(None)
        ).scalar() or Decimal(0)

        # Total downtime this month
        total_downtime = self.db.query(func.sum(MaintenanceLog.downtime)).filter(
            MaintenanceLog.date >= first_day,
            MaintenanceLog.date < datetime.now(),
        ).scalar() or 0

        # Overdue maintenance (past scheduled date)
        overdue = self.db.query(func.count(MaintenanceLog.id)).filter(
            MaintenanceLog.next_maintenance_date < datetime.now(),
            MaintenanceLog.status != 'completed',
        ).scalar() or 0

        return {
            "active_tasks": active_tasks,
            "monthly_cost": float(monthly_cost),
            "avg_cost_per_task": float(avg_cost),
            "total_downtime_hours": total_downtime // 60 if total_downtime else 0,
            "overdue_maintenance": overdue,
            "completion_rate": self._calculate_completion_rate(),
        }

    def _get_inventory_stats(self) -> dict:
        """Get inventory-related statistics"""
        total_items = self.db.query(func.count(InventoryItem.id)).scalar() or 0
        
        low_stock = self.db.query(func.count(InventoryItem.id)).filter(
            InventoryItem.quantity <= InventoryItem.reorder_level
        ).scalar() or 0

        critical_stock = self.db.query(func.count(InventoryItem.id)).filter(
            InventoryItem.quantity == 0
        ).scalar() or 0

        total_value = self.db.query(
            func.sum(InventoryItem.quantity * InventoryItem.price)
        ).scalar() or Decimal(0)

        return {
            "total_items": total_items,
            "low_stock_count": low_stock,
            "critical_stock_count": critical_stock,
            "total_value": float(total_value),
            "stock_health_percentage": self._calculate_stock_health(),
        }

    def _get_fleet_stats(self) -> dict:
        """Get fleet management statistics"""
        total_vehicles = self.db.query(func.count(Vehicle.id)).scalar() or 0
        
        active_vehicles = self.db.query(func.count(Vehicle.id)).filter(
            Vehicle.status == 'active'
        ).scalar() or 0

        total_mileage = self.db.query(func.sum(Vehicle.current_mileage)).scalar() or Decimal(0)
        
        last_week_mileage = self.db.query(
            func.sum(VehicleUsageLog.distance)
        ).filter(
            VehicleUsageLog.date >= datetime.now() - timedelta(days=7)
        ).scalar() or Decimal(0)

        avg_fuel_consumption = self.db.query(func.avg(VehicleUsageLog.fuel_used)).scalar() or Decimal(0)

        return {
            "total_vehicles": total_vehicles,
            "active_vehicles": active_vehicles,
            "inactive_vehicles": total_vehicles - active_vehicles,
            "total_mileage": float(total_mileage),
            "last_week_mileage": float(last_week_mileage),
            "avg_fuel_consumption": float(avg_fuel_consumption),
            "utilization_rate": (active_vehicles / total_vehicles * 100) if total_vehicles else 0,
        }

    def _get_sensor_stats(self) -> dict:
        """Get IoT sensor statistics"""
        total_sensors = self.db.query(func.count(SensorLog.id)).scalar() or 0
        
        critical_alerts = self.db.query(func.count(SensorLog.id)).filter(
            SensorLog.status == 'critical'
        ).scalar() or 0

        warning_alerts = self.db.query(func.count(SensorLog.id)).filter(
            SensorLog.status == 'warning'
        ).scalar() or 0

        normal_sensors = self.db.query(func.count(SensorLog.id)).filter(
            SensorLog.status == 'normal'
        ).scalar() or 0

        return {
            "total_sensors": total_sensors,
            "critical_alerts": critical_alerts,
            "warning_alerts": warning_alerts,
            "normal_sensors": normal_sensors,
            "alert_percentage": (
                (critical_alerts + warning_alerts) / total_sensors * 100
                if total_sensors else 0
            ),
        }

    def _get_assets_by_type(self) -> dict:
        """Get asset count grouped by type"""
        results = self.db.query(
            Asset.type,
            func.count(Asset.id).label('count')
        ).filter(
            Asset.is_deleted == False
        ).group_by(Asset.type).all()

        return {asset_type: count for asset_type, count in results}

    def _get_assets_by_status(self) -> dict:
        """Get asset count grouped by status"""
        results = self.db.query(
            Asset.status,
            func.count(Asset.id).label('count')
        ).filter(
            Asset.is_deleted == False
        ).group_by(Asset.status).all()

        return {status: count for status, count in results}

    def _get_chart_data(self) -> dict:
        """Get data for frontend charts"""
        # Monthly maintenance cost trend (last 6 months)
        maintenance_trend = self._get_maintenance_trend()
        
        # Asset value trend (last 6 months)
        value_trend = self._get_value_trend()
        
        return {
            "maintenance_cost_trend": maintenance_trend,
            "asset_value_trend": value_trend,
            "asset_distribution": self._get_assets_by_type(),
            "status_distribution": self._get_assets_by_status(),
        }

    def _get_recent_activities(self, limit: int = 5) -> list:
        """Get recent maintenance activities"""
        activities = self.db.query(MaintenanceLog).order_by(
            MaintenanceLog.date.desc()
        ).limit(limit).all()

        return [
            {
                "id": str(activity.id),
                "asset_id": str(activity.asset_id),
                "asset_name": activity.asset.name if activity.asset else "Unknown",
                "type": activity.maintenance_type,
                "status": activity.status,
                "date": activity.date.isoformat() if activity.date else None,
                "technician": activity.technician,
                "cost": float(activity.cost) if activity.cost else 0,
            }
            for activity in activities
        ]

    def _get_low_stock_alerts(self, limit: int = 5) -> list:
        """Get inventory items below reorder level"""
        items = self.db.query(InventoryItem).filter(
            InventoryItem.quantity <= InventoryItem.reorder_level
        ).order_by(InventoryItem.quantity.asc()).limit(limit).all()

        return [
            {
                "id": str(item.id),
                "name": item.name,
                "item_code": item.item_code,
                "quantity": item.quantity,
                "reorder_level": item.reorder_level,
                "status": "critical" if item.quantity == 0 else "warning",
                "supplier": item.supplier,
                "price": float(item.price) if item.price else 0,
            }
            for item in items
        ]

    def _get_critical_alerts(self) -> dict:
        """Get all critical system alerts"""
        return {
            "maintenance": self._get_maintenance_stats()["overdue_maintenance"],
            "inventory": self._get_inventory_stats()["critical_stock_count"],
            "sensors": self._get_sensor_stats()["critical_alerts"],
        }

    def _calculate_completion_rate(self) -> float:
        """Calculate maintenance task completion rate"""
        total = self.db.query(func.count(MaintenanceLog.id)).scalar() or 0
        completed = self.db.query(func.count(MaintenanceLog.id)).filter(
            MaintenanceLog.status == 'completed'
        ).scalar() or 0
        
        return (completed / total * 100) if total else 0

    def _calculate_stock_health(self) -> float:
        """Calculate overall inventory stock health percentage"""
        total = self.db.query(func.count(InventoryItem.id)).scalar() or 0
        healthy = self.db.query(func.count(InventoryItem.id)).filter(
            InventoryItem.quantity > InventoryItem.reorder_level
        ).scalar() or 0
        
        return (healthy / total * 100) if total else 0

    def _get_maintenance_trend(self) -> list:
        """Get monthly maintenance cost trend for last 6 months"""
        trend = []
        for i in range(5, -1, -1):
            month_start = datetime.now().replace(day=1) - timedelta(days=30*i)
            month_start = month_start.replace(day=1)
            month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1)
            
            cost = self.db.query(func.sum(MaintenanceLog.cost)).filter(
                MaintenanceLog.date >= month_start,
                MaintenanceLog.date < month_end,
            ).scalar() or 0
            
            trend.append({
                "month": month_start.strftime("%b %Y"),
                "cost": float(cost),
            })
        
        return trend

    def _get_value_trend(self) -> list:
        """Get asset value trend (simulated)"""
        # Note: This would need to be enhanced with historical asset value tracking
        trend = []
        current_value = float(self._get_asset_overview()["total_value"])
        
        for i in range(5, -1, -1):
            trend.append({
                "month": (datetime.now() - timedelta(days=30*i)).strftime("%b %Y"),
                "value": current_value - (5000 * i),  # Simulated depreciation
            })
        
        return trend


# Instantiate for use in routes
dashboard_service = DashboardService()
