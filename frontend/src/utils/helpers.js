export function formatETB(amount) {
    return `ETB ${amount.toLocaleString('en-US')}`
}

export function formatDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

/**
 * Simple class name merge utility.
 * Joins all truthy arguments into a single class string.
 */
export function cn(...inputs) {
    return inputs.filter(Boolean).join(' ')
}
