
/**
 * PageLayout - Consistent page structure with optional hero section
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Optional subtitle/description
 * @param {React.ReactNode} props.icon - Optional icon element
 * @param {string} props.iconColor - Gradient color for icon (primary, cyan, purple, emerald)
 * @param {React.ReactNode} props.actions - Optional action buttons for header
 * @param {boolean} props.showHero - Whether to show the hero section (default: true)
 * @param {boolean} props.showDecorations - Whether to show background decorations (default: true)
 * @param {string} props.maxWidth - Max width class (default: max-w-7xl)
 * @param {string} props.className - Additional classes for the container
 */
export default function PageLayout({
  children,
  title,
  subtitle,
  icon: Icon,
  iconColor = 'primary',
  actions,
  showHero = true,
  showDecorations = true,
  maxWidth = 'max-w-7xl',
  className = ''
}) {
  const colorVariants = {
    primary: {
      gradient: 'from-primary-500 to-primary-600',
      shadow: 'shadow-primary-500/25',
      decoration: 'bg-primary-500/10'
    },
    cyan: {
      gradient: 'from-cyan-500 to-cyan-600',
      shadow: 'shadow-cyan-500/25',
      decoration: 'bg-cyan-500/10'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/25',
      decoration: 'bg-purple-500/10'
    },
    emerald: {
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/25',
      decoration: 'bg-emerald-500/10'
    }
  };

  const colors = colorVariants[iconColor] || colorVariants.primary;

  return (
    <div className={`min-h-screen bg-gradient-to-b from-charcoal-50 to-white ${className}`}>
      {showHero && (
        <div className="relative overflow-hidden">
          {/* Background Decorations */}
          {showDecorations && (
            <>
              <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
              <div className={`absolute -top-24 -right-24 w-96 h-96 ${colors.decoration} rounded-full blur-3xl`} />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            </>
          )}

          <div className={`relative ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-12`}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-6">
                {Icon && (
                  <div className={`w-20 h-20 bg-gradient-to-br ${colors.gradient} rounded-2xl flex items-center justify-center shadow-xl ${colors.shadow} flex-shrink-0`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                )}
                <div>
                  {title && (
                    <h1 className="text-4xl sm:text-5xl font-bold text-charcoal-900 mb-3">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-lg text-charcoal-600 max-w-2xl">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {actions && (
                <div className="flex items-center gap-3 flex-shrink-0">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 ${showHero ? 'pb-12' : 'py-12'}`}>
        {children}
      </div>
    </div>
  );
}
