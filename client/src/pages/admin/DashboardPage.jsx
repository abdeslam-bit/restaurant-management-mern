import { useEffect, useState } from 'react';
import { getAnalyticsOverview } from '../../api/analytics';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DollarSign, ShoppingBag, Clock, Calendar, TrendingUp, BarChart2 } from 'lucide-react';
import './DashboardPage.css';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {sub && <p className="stat-card__sub">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsOverview()
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading analytics..." />;
  if (!data) return <div className="empty-state"><p>Could not load analytics. Please check server connection.</p></div>;

  const maxSales = Math.max(...data.salesByDay.map((d) => d.sales), 1);

  return (
    <div className="dashboard fade-in">
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="admin-page-subtitle">Restaurant overview and performance metrics.</p>
        </div>
        <span className="admin-page-date">{new Date().toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</span>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard icon={<DollarSign size={20} />} label="Today's Sales" value={`$${data.dailySales.toFixed(2)}`} sub={`${data.dailyOrderCount} orders today`} color="#c0533a" />
        <StatCard icon={<ShoppingBag size={20} />} label="Total Orders" value={data.totalOrders.toLocaleString()} sub={`${data.activeOrders} active`} color="#d4a853" />
        <StatCard icon={<Clock size={20} />} label="Active Orders" value={data.activeOrders} sub="In progress" color="#2563a8" />
        <StatCard icon={<Calendar size={20} />} label="Pending Reservations" value={data.pendingReservations} sub="Awaiting confirmation" color="#2d7a4f" />
        <StatCard icon={<TrendingUp size={20} />} label="Total Revenue" value={`$${data.totalRevenue.toFixed(2)}`} sub="All time" color="#c0533a" />
      </div>

      <div className="dashboard-grid">
        {/* 7-Day Sales Chart */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <h3>Sales — Last 7 Days</h3>
            <BarChart2 size={18} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <div className="bar-chart">
            {data.salesByDay.map((day) => (
              <div key={day.date} className="bar-chart__bar-wrap">
                <div className="bar-chart__bar-label">${day.sales.toFixed(0)}</div>
                <div className="bar-chart__bar-track">
                  <div
                    className="bar-chart__bar-fill"
                    style={{ height: `${Math.max((day.sales / maxSales) * 100, 4)}%` }}
                    title={`$${day.sales.toFixed(2)}, ${day.orders} orders`}
                  />
                </div>
                <div className="bar-chart__bar-date">
                  {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <h3>Top Selling Items</h3>
          </div>
          {data.topItems.length === 0 ? (
            <div className="empty-state" style={{ minHeight: '160px' }}>
              <p>No sales data yet.</p>
            </div>
          ) : (
            <ul className="top-items-list">
              {data.topItems.map((item, i) => (
                <li key={i} className="top-item">
                  <span className="top-item__rank">#{i + 1}</span>
                  <div className="top-item__info">
                    <p className="top-item__name">{item.name || 'Unknown Item'}</p>
                    <div className="top-item__bar-track">
                      <div
                        className="top-item__bar-fill"
                        style={{ width: `${(item.totalSold / (data.topItems[0]?.totalSold || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="top-item__stats">
                    <span className="top-item__sold">{item.totalSold} sold</span>
                    <span className="top-item__rev">${item.revenue?.toFixed(2)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <h3>Order Status Breakdown</h3>
          </div>
          <div className="status-breakdown">
            {data.statusBreakdown.map((s) => (
              <div key={s._id} className="status-row">
                <span className={`badge badge-${s._id.toLowerCase().replace(/\s/g, '-')}`}>{s._id}</span>
                <div className="status-row__bar-track">
                  <div
                    className="status-row__bar-fill"
                    style={{ width: `${(s.count / data.totalOrders) * 100}%` }}
                  />
                </div>
                <span className="status-row__count">{s.count}</span>
              </div>
            ))}
            {data.statusBreakdown.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No orders yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
