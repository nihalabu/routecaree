// src/components/shared/Badge.js
export default function Badge({ children, variant = 'pending', className = '' }) {
    const variantClasses = {
        pending: 'badge-pending',
        'in-progress': 'badge-in-progress',
        'in_progress': 'badge-in-progress',
        completed: 'badge-completed'
    };

    const classes = `badge ${variantClasses[variant] || 'badge-pending'} ${className}`;

    return (
        <span className={classes}>
            {children}
        </span>
    );
}
