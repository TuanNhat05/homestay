import { BedDouble, CalendarCheck, CircleDollarSign, ExternalLink, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
import FormMessage from '../components/FormMessage';
import PageHeader from '../components/PageHeader';
import { formatCurrency } from '../utils/booking';

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard/summary')
      .then((res) => setSummary(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  const metrics = [
    {
      label: 'Tổng phòng',
      value: summary?.totalRooms || 0,
      icon: BedDouble,
      gradient: 'bg-gradient-pine',
      glow: 'shadow-glow',
      color: 'text-emerald-400',
      link: '/rooms',
    },
    {
      label: 'Khách hàng',
      value: summary?.totalCustomers || 0,
      icon: Users,
      gradient: 'bg-gradient-ocean',
      glow: 'shadow-glow-ocean',
      color: 'text-sky-400',
      link: '/customers',
    },
    {
      label: 'Booking đang xử lý',
      value: summary?.activeBookings || 0,
      icon: CalendarCheck,
      gradient: 'bg-gradient-violet',
      glow: 'shadow-glow-violet',
      color: 'text-violet-400',
      link: '/bookings?status=active',
    },
    {
      label: 'Doanh thu dự kiến',
      value: formatCurrency(summary?.totalRevenue || 0),
      icon: CircleDollarSign,
      gradient: 'bg-gradient-amber',
      glow: '',
      color: 'text-amber-400',
      link: '/bookings?status=all',
    },
  ];

  const stats = [
    {
      label: 'Hoàn tất',
      value: summary?.completedBookings || 0,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      link: '/bookings?status=completed',
    },
    {
      label: 'Đã hủy',
      value: summary?.cancelledBookings || 0,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      link: '/bookings?status=cancelled',
    },
    {
      label: 'Tổng tiền cọc',
      value: formatCurrency(summary?.totalDeposit || 0),
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      link: '/bookings?status=all',
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Tổng quan nhanh tình hình phòng, khách và booking."
      />
      <FormMessage>{error}</FormMessage>

      {/* Greeting */}
      <div className="mb-6 animate-fadeIn">
        <p className="text-lg text-ink-muted">
          {greeting} 👋 <span className="font-semibold text-ink">Hôm nay là một ngày đẹp trời!</span>
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 stagger-children">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Link
              key={metric.label}
              to={metric.link}
              className="metric-card group cursor-pointer no-underline"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${metric.gradient} ${metric.glow}`}>
                  <Icon size={20} className="text-white" />
                </div>
                <ExternalLink size={14} className="text-ink-dim opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              </div>
              <div className="text-sm text-ink-dim">{metric.label}</div>
              <div className={`mt-1 text-2xl font-bold ${metric.color}`}>{metric.value}</div>
            </Link>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3 stagger-children">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className={`rounded-2xl border ${stat.border} ${stat.bg} p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer no-underline block`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
                <TrendingUp size={14} className={stat.color} />
                {stat.label}
              </div>
              <ExternalLink size={14} className="text-ink-dim opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </div>
            <div className={`mt-3 text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default DashboardPage;
