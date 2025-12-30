import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function ToolCard({
  icon: Icon,
  title,
  description,
  stats,
  path,
  color = 'primary',
  comingSoon = false,
  badge = null
}) {
  const navigate = useNavigate();

  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      border: 'border-primary-200 hover:border-primary-400',
      icon: 'bg-primary-100 text-primary-600',
      button: 'bg-primary-600 hover:bg-primary-700 text-white',
      badge: 'bg-primary-100 text-primary-700'
    },
    cyan: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200 hover:border-cyan-400',
      icon: 'bg-cyan-100 text-cyan-600',
      button: 'bg-cyan-600 hover:bg-cyan-700 text-white',
      badge: 'bg-cyan-100 text-cyan-700'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200 hover:border-purple-400',
      icon: 'bg-purple-100 text-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700 text-white',
      badge: 'bg-purple-100 text-purple-700'
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200 hover:border-emerald-400',
      icon: 'bg-emerald-100 text-emerald-600',
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      badge: 'bg-emerald-100 text-emerald-700'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: 'bg-gray-100 text-gray-400',
      button: 'bg-gray-400 cursor-not-allowed text-white',
      badge: 'bg-gray-100 text-gray-500'
    }
  };

  const colors = colorClasses[comingSoon ? 'gray' : color];

  const handleClick = () => {
    if (!comingSoon && path) {
      navigate(path);
    }
  };

  return (
    <div
      className={`relative rounded-xl border-2 ${colors.border} ${colors.bg} p-6 transition-all duration-200 ${
        comingSoon ? 'opacity-75' : 'cursor-pointer hover:shadow-lg hover:-translate-y-1'
      }`}
      onClick={handleClick}
    >
      {/* Badge */}
      {badge && (
        <span className={`absolute top-4 right-4 px-2 py-1 text-xs font-medium rounded-full ${colors.badge}`}>
          {badge}
        </span>
      )}

      {/* Coming Soon Overlay */}
      {comingSoon && (
        <span className="absolute top-4 right-4 px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
          Coming Soon
        </span>
      )}

      {/* Icon */}
      <div className={`w-14 h-14 rounded-xl ${colors.icon} flex items-center justify-center mb-4`}>
        <Icon className="w-7 h-7" />
      </div>

      {/* Title */}
      <h3 className={`text-xl font-bold mb-2 ${comingSoon ? 'text-gray-400' : 'text-gray-900'}`}>
        {title}
      </h3>

      {/* Description */}
      <p className={`text-sm mb-4 ${comingSoon ? 'text-gray-400' : 'text-gray-600'}`}>
        {description}
      </p>

      {/* Stats */}
      {stats && stats.length > 0 && (
        <div className="flex gap-4 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className={`text-2xl font-bold ${comingSoon ? 'text-gray-400' : 'text-gray-900'}`}>
                {stat.value}
              </p>
              <p className={`text-xs ${comingSoon ? 'text-gray-400' : 'text-gray-500'}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      <button
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${colors.button}`}
        disabled={comingSoon}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        {comingSoon ? 'Coming Soon' : 'Open Tool'}
        {!comingSoon && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
}
