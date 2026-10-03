export interface ReviewerProfile {
  id: string;
  role: 'STUDENT' | 'EMPLOYER' | 'ADMIN';
  studentProfile?: {
    fullName: string;
    university?: string | null;
    major?: string | null;
  } | null;
  employerProfile?: {
    companyName: string;
    address?: string | null;
  } | null;
}

export interface Review {
  id: string;
  applicationId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string | null;
  isHidden: boolean;
  createdAt: string;
  reviewer?: ReviewerProfile;
  application?: {
    id: string;
    job?: {
      id: string;
      title: string;
    };
  };
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  [key: number]: number;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistribution;
}

export interface PublicUserProfile {
  id: string;
  email: string;
  role: 'STUDENT' | 'EMPLOYER' | 'ADMIN';
  createdAt: string;
  name: string;
  studentProfile?: {
    fullName: string;
    phone?: string | null;
    university?: string | null;
    major?: string | null;
    bio?: string | null;
    cvUrl?: string | null;
    skills: string[];
  } | null;
  employerProfile?: {
    companyName: string;
    description?: string | null;
    address?: string | null;
    phone?: string | null;
    website?: string | null;
    isVerified: boolean;
  } | null;
}

export interface UserReviewsResponse {
  user: PublicUserProfile;
  summary: ReviewSummary;
  reviews: Review[];
}

export interface CreateReviewData {
  rating: number;
  comment?: string;
}

export interface ApplicationReviewsStatus {
  applicationId: string;
  canReview: boolean;
  myReview?: Review | null;
  counterpartReview?: Review | null;
  reviews: Review[];
}
