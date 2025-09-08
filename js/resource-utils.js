// Resource utility functions to ensure clean data for Supabase

/**
 * Sanitizes a resource object to only include valid database columns
 * Removes any fields that don't exist in the resources table schema
 */
export function sanitizeResourceForDB(resource) {
    // Only include fields that exist in the resources table
    const validResource = {
        name: resource.name || resource.title || 'Untitled Resource',
        category: resource.category || 'other',
        url: resource.url || '',
        description: resource.description || '',
        featured: resource.featured === true
    };
    
    // Only include id if it exists (for updates)
    if (resource.id) {
        validResource.id = resource.id;
    }
    
    return validResource;
}

/**
 * Prepares a resource for display/localStorage (can have extra fields)
 */
export function prepareResourceForDisplay(resource) {
    return {
        ...resource,
        // Add display-only fields here if needed
        displayName: resource.name || resource.title || 'Untitled',
        // Tags can exist in localStorage/display but not in DB
        tags: resource.tags || [],
        // Other UI-specific fields
        saved: resource.saved || false,
        dateAdded: resource.dateAdded || resource.created_at || new Date().toISOString()
    };
}

/**
 * Validates if a resource has required fields
 */
export function validateResource(resource) {
    const errors = [];
    
    if (!resource.name && !resource.title) {
        errors.push('Resource must have a name');
    }
    
    if (!resource.url) {
        errors.push('Resource must have a URL');
    }
    
    // Validate URL format
    try {
        new URL(resource.url);
    } catch {
        errors.push('Resource URL must be valid');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Filters out database-specific fields from a resource object
 */
export function stripDatabaseFields(resource) {
    const {
        created_at,
        updated_at,
        ...rest
    } = resource;
    
    return rest;
}

/**
 * Merges resource data from different sources
 */
export function mergeResourceData(dbResource, localResource) {
    return {
        ...localResource,
        ...dbResource,
        // Preserve local-only fields
        tags: localResource.tags,
        notes: localResource.notes,
        saved: true
    };
}