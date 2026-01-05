import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';

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

  const colorVariants = {
    primary: {
      gradient: 'from-primary-500 to-primary-600',
      lightGradient: 'from-primary-50 to-primary-100/50',
      icon: 'from-primary-500 to-primary-600',
      iconBg: 'bg-primary-50',
      text: 'text-primary-600',
      badge: 'bg-primary-100 text-primary-700 border-primary-200',
      button: 'from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700',
      glow: 'group-hover:shadow-primary-500/20',
      ring: 'ring-primary-500/20'
    },
    cyan: {
      gradient: 'from-cyan-500 to-cyan-600',
      lightGradient: 'from-cyan-50 to-cyan-100/50',
      icon: 'from-cyan-500 to-cyan-600',
      iconBg: 'bg-cyan-50',
      text: 'text-cyan-600',
      badge: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      button: 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
      glow: 'group-hover:shadow-cyan-500/20',
      ring: 'ring-cyan-500/20'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      lightGradient: 'from-purple-50 to-purple-100/50',
      icon: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-50',
      text: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-700 border-purple-200',
      button: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      glow: 'group-hover:shadow-purple-500/20',
      ring: 'ring-purple-500/20'
    },
    emerald: {
      gradient: 'from-emerald-500 to-emerald-600',
      lightGradient: 'from-emerald-50 to-emerald-100/50',
      icon: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-50',
      text: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      button: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
      glow: 'group-hover:shadow-emerald-500/20',
      ring: 'ring-emerald-500/20'
    }
  };

  const colors = colorVariants[color] || colorVariants.primary;

  const handleClick = () => {
    if (!comingSoon && path) {
      navigate(path);
    }
  };

  if (comingSoon) {
    return (
      <div className="group relative card bg-gradient-to-br from-charcoal-50 to-charcoal-100/50 p-6 opacity-75">
        {/* Coming Soon Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-charcoal-200/80 text-charcoal-500">
          <Lock className="w-3 h-3" />
          <span className="text-xs font-medium">Coming Soon</span>
        </div>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-charcoal-200/70 flex items-center justify-center mb-5">
          <Icon className="w-7 h-7 text-charcoal-400" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-charcoal-400 mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-charcoal-400 leading-relaxed mb-6">
          {description}
        </p>

        {/* Disabled Button */}
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm bg-charcoal-200 text-charcoal-400 cursor-not-allowed"
        >
          Coming Soon
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`group relative card card-hover cursor-pointer overflow-hidden bg-gradient-to-br ${colors.lightGradient} p-6`}
    >
      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${colors.lightGradient}`} />

      {/* Badge */}
      {badge && (
        <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${colors.badge}`}>
          {badge === 'New' && <Sparkles className="w-3 h-3" />}
          <span className="text-xs font-medium">{badge}</span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.icon} flex items-center justify-center mb-5 shadow-lg ${colors.glow} group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-charcoal-900 mb-2 group-hover:text-charcoal-800 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-charcoal-600 leading-relaxed mb-5">
          {description}
        </p>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="flex items-center gap-6 mb-5 pb-5 border-b border-charcoal-200/50">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl font-bold text-charcoal-900">
                  {stat.value}
                </p>
                <p className="text-xs text-charcoal-500 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm text-white bg-gradient-to-r ${colors.button} shadow-sm hover:shadow-md transition-all duration-200 group/btn`}
        >
          Open Tool
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
