// ========== REVIEWS AND RATINGS SYSTEM ==========

/**
 * Sistema de Reseñas y Calificaciones
 * 
 * Funcionalidades:
 * - Calificar organizadores después de comprar
 * - Dejar comentarios sobre la experiencia
 * - Ver calificaciones promedio de organizadores
 * - Sistema de confianza entre clientes y vendedores
 */

// ========== REVIEW MANAGEMENT ==========

/**
 * Create a review for an organizer
 */
function createReview(reviewData) {
    const reviews = JSON.parse(localStorage.getItem('organizerReviews') || '[]');
    
    // Check if user already reviewed this organizer for this rifa
    const existingReview = reviews.find(r => 
        r.userId === reviewData.userId && 
        r.organizerId === reviewData.organizerId &&
        r.rifaId === reviewData.rifaId
    );
    
    if (existingReview) {
        return {
            success: false,
            error: 'Ya has dejado una reseña para esta rifa'
        };
    }
    
    const review = {
        id: 'REV-' + Date.now(),
        userId: reviewData.userId,
        userName: reviewData.userName,
        userAvatar: reviewData.userAvatar,
        organizerId: reviewData.organizerId,
        rifaId: reviewData.rifaId,
        rifaTitle: reviewData.rifaTitle,
        rating: reviewData.rating, // 1-5 stars
        comment: reviewData.comment || '',
        purchaseId: reviewData.purchaseId,
        createdAt: new Date().toISOString(),
        verified: true, // Only verified purchasers can review
        helpful: 0, // Helpful votes
        reported: false
    };
    
    reviews.push(review);
    localStorage.setItem('organizerReviews', JSON.stringify(reviews));
    
    // Update organizer rating
    updateOrganizerRating(reviewData.organizerId);
    
    return {
        success: true,
        review: review
    };
}

/**
 * Get reviews for an organizer
 */
function getOrganizerReviews(organizerId, filters = {}) {
    let reviews = JSON.parse(localStorage.getItem('organizerReviews') || '[]');
    
    // Filter by organizer
    reviews = reviews.filter(r => r.organizerId === organizerId);
    
    // Filter by rating
    if (filters.minRating) {
        reviews = reviews.filter(r => r.rating >= filters.minRating);
    }
    
    // Filter by verified
    if (filters.verifiedOnly) {
        reviews = reviews.filter(r => r.verified);
    }
    
    // Sort
    const sortBy = filters.sortBy || 'newest';
    reviews.sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'oldest') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortBy === 'highest') {
            return b.rating - a.rating;
        } else if (sortBy === 'lowest') {
            return a.rating - b.rating;
        } else if (sortBy === 'helpful') {
            return b.helpful - a.helpful;
        }
        return 0;
    });
    
    return reviews;
}

/**
 * Get reviews for a specific rifa
 */
function getRifaReviews(rifaId) {
    const reviews = JSON.parse(localStorage.getItem('organizerReviews') || '[]');
    return reviews.filter(r => r.rifaId === rifaId);
}

/**
 * Get organizer rating statistics
 */
function getOrganizerRatingStats(organizerId) {
    const reviews = getOrganizerReviews(organizerId);
    
    if (reviews.length === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            verifiedReviews: 0
        };
    }
    
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
        ratingDistribution[r.rating]++;
    });
    
    const verifiedReviews = reviews.filter(r => r.verified).length;
    
    return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        ratingDistribution: ratingDistribution,
        verifiedReviews: verifiedReviews,
        percentageByRating: {
            5: Math.round((ratingDistribution[5] / reviews.length) * 100),
            4: Math.round((ratingDistribution[4] / reviews.length) * 100),
            3: Math.round((ratingDistribution[3] / reviews.length) * 100),
            2: Math.round((ratingDistribution[2] / reviews.length) * 100),
            1: Math.round((ratingDistribution[1] / reviews.length) * 100)
        }
    };
}

/**
 * Update organizer rating
 */
function updateOrganizerRating(organizerId) {
    const stats = getOrganizerRatingStats(organizerId);
    
    // Save to organizer data
    const organizers = JSON.parse(localStorage.getItem('organizers') || '[]');
    const organizerIndex = organizers.findIndex(o => o.id === organizerId);
    
    if (organizerIndex !== -1) {
        organizers[organizerIndex].rating = stats.averageRating;
        organizers[organizerIndex].totalReviews = stats.totalReviews;
        localStorage.setItem('organizers', JSON.stringify(organizers));
    }
    
    // Also update in myRifas if organizer has rifas
    const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
    myRifas.forEach(rifa => {
        if (rifa.organizerId === organizerId) {
            rifa.organizerRating = stats.averageRating;
            rifa.organizerTotalReviews = stats.totalReviews;
        }
    });
    localStorage.setItem('myRifas', JSON.stringify(myRifas));
}

/**
 * Mark review as helpful
 */
function markReviewHelpful(reviewId, userId) {
    const reviews = JSON.parse(localStorage.getItem('organizerReviews') || '[]');
    const review = reviews.find(r => r.id === reviewId);
    
    if (!review) {
        return { success: false, error: 'Reseña no encontrada' };
    }
    
    // Check if user already marked as helpful
    const helpfulUsers = JSON.parse(localStorage.getItem(`review_${reviewId}_helpful`) || '[]');
    
    if (helpfulUsers.includes(userId)) {
        // Remove helpful
        const index = helpfulUsers.indexOf(userId);
        helpfulUsers.splice(index, 1);
        review.helpful = Math.max(0, review.helpful - 1);
    } else {
        // Add helpful
        helpfulUsers.push(userId);
        review.helpful = (review.helpful || 0) + 1;
    }
    
    localStorage.setItem(`review_${reviewId}_helpful`, JSON.stringify(helpfulUsers));
    
    const reviewIndex = reviews.findIndex(r => r.id === reviewId);
    if (reviewIndex !== -1) {
        reviews[reviewIndex] = review;
        localStorage.setItem('organizerReviews', JSON.stringify(reviews));
    }
    
    return {
        success: true,
        helpful: review.helpful
    };
}

/**
 * Report a review
 */
function reportReview(reviewId, reason) {
    const reviews = JSON.parse(localStorage.getItem('organizerReviews') || '[]');
    const review = reviews.find(r => r.id === reviewId);
    
    if (!review) {
        return { success: false, error: 'Reseña no encontrada' };
    }
    
    review.reported = true;
    review.reportReason = reason;
    review.reportedAt = new Date().toISOString();
    
    const reviewIndex = reviews.findIndex(r => r.id === reviewId);
    if (reviewIndex !== -1) {
        reviews[reviewIndex] = review;
        localStorage.setItem('organizerReviews', JSON.stringify(reviews));
    }
    
    return {
        success: true,
        message: 'Reseña reportada. Nuestro equipo la revisará.'
    };
}

/**
 * Check if user can review an organizer for a rifa
 */
function canUserReview(userId, organizerId, rifaId) {
    // Check if user has purchased from this organizer
    const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
    const hasPurchased = purchases.some(p => 
        p.userId === userId && 
        p.rifaId === rifaId &&
        p.paymentStatus === 'confirmed'
    );
    
    if (!hasPurchased) {
        return {
            canReview: false,
            reason: 'Debes haber comprado en esta rifa para dejar una reseña'
        };
    }
    
    // Check if already reviewed
    const reviews = JSON.parse(localStorage.getItem('organizerReviews') || '[]');
    const alreadyReviewed = reviews.some(r => 
        r.userId === userId && 
        r.organizerId === organizerId &&
        r.rifaId === rifaId
    );
    
    if (alreadyReviewed) {
        return {
            canReview: false,
            reason: 'Ya has dejado una reseña para esta rifa'
        };
    }
    
    return {
        canReview: true
    };
}

/**
 * Get user's reviews
 */
function getUserReviews(userId) {
    const reviews = JSON.parse(localStorage.getItem('organizerReviews') || '[]');
    return reviews.filter(r => r.userId === userId);
}

// ========== EXPORTS ==========

window.createReview = createReview;
window.getOrganizerReviews = getOrganizerReviews;
window.getRifaReviews = getRifaReviews;
window.getOrganizerRatingStats = getOrganizerRatingStats;
window.markReviewHelpful = markReviewHelpful;
window.reportReview = reportReview;
window.canUserReview = canUserReview;
window.getUserReviews = getUserReviews;

