import { prisma } from "../config/database.js";

export interface MentorMatch {
  mentorId: string;
  score: number;
  matchedSkills: string[];
  matchedInterests: string[];
  locationMatch: boolean;
  availability: string;
  yearsExperience: number | null;
  profile: {
    id: string;
    bio: string | null;
    availability: string;
    yearsExperience: number | null;
    skills: string[];
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
      location: string | null;
      bio: string | null;
    };
  };
}

export interface MatchingCriteria {
  skills?: string[];
  interests?: string[];
  location?: string;
  minExperience?: number;
  availability?: "available" | "busy" | "unavailable";
  acceptsRemote?: boolean;
}

const SKILL_WEIGHT = 10;
const INTEREST_WEIGHT = 5;
const LOCATION_WEIGHT = 8;
const EXPERIENCE_WEIGHT = 3;
const AVAILABILITY_BONUS = 15;
const REMOTE_BONUS = 5;

export async function findMatchingMentors(
  userId: string,
  criteria?: MatchingCriteria,
  limit: number = 10,
): Promise<MentorMatch[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: true,
      interests: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const userSkills =
    criteria?.skills || user.skills.map((s) => s.skill.toLowerCase());
  const userInterests =
    criteria?.interests || user.interests.map((i) => i.interest.toLowerCase());
  const userLocation = criteria?.location || user.location?.toLowerCase();

  const whereClause: Record<string, unknown> = {};

  if (criteria?.availability) {
    whereClause.availability = criteria.availability;
  }

  if (criteria?.acceptsRemote !== undefined) {
    whereClause.acceptsRemote = criteria.acceptsRemote;
  }

  const mentors = await prisma.mentorProfile.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          location: true,
          bio: true,
        },
      },
      skills: true,
    },
  });

  const matches: MentorMatch[] = mentors
    .filter((mentor) => {
      if (mentor.userId === userId) return false;
      if (mentor.availability === "unavailable") return false;
      if (mentor.currentMenteesCount >= mentor.maxMentees) return false;
      if (
        criteria?.minExperience &&
        (mentor.yearsExperience || 0) < criteria.minExperience
      ) {
        return false;
      }
      return true;
    })
    .map((mentor) => {
      const mentorSkills = mentor.skills.map((s) => s.skill.toLowerCase());
      const mentorLocation = mentor.user.location?.toLowerCase();

      const matchedSkills = userSkills.filter((skill) =>
        mentorSkills.some((ms) => ms.includes(skill) || skill.includes(ms)),
      );

      const matchedInterests = userInterests.filter((interest) =>
        mentorSkills.some(
          (ms) => ms.includes(interest) || interest.includes(ms),
        ),
      );

      const locationMatch =
        userLocation && mentorLocation
          ? userLocation.includes(mentorLocation) ||
            mentorLocation.includes(userLocation)
          : false;

      let score = 0;

      score += matchedSkills.length * SKILL_WEIGHT;
      score += matchedInterests.length * INTEREST_WEIGHT;

      if (locationMatch) {
        score += LOCATION_WEIGHT;
      }

      if (mentor.yearsExperience) {
        const expBonus = Math.min(
          mentor.yearsExperience * EXPERIENCE_WEIGHT,
          30,
        );
        score += expBonus;
      }

      if (mentor.availability === "available") {
        score += AVAILABILITY_BONUS;
      }

      if (mentor.acceptsRemote) {
        score += REMOTE_BONUS;
      }

      return {
        mentorId: mentor.id,
        score,
        matchedSkills,
        matchedInterests,
        locationMatch,
        availability: mentor.availability,
        yearsExperience: mentor.yearsExperience,
        profile: {
          id: mentor.id,
          bio: mentor.bio,
          availability: mentor.availability,
          yearsExperience: mentor.yearsExperience,
          skills: mentor.skills.map((s) => s.skill),
          user: mentor.user,
        },
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return matches;
}

export async function getRecommendedMentors(
  userId: string,
): Promise<MentorMatch[]> {
  return findMatchingMentors(userId, undefined, 5);
}

export async function searchMentors(
  query: string,
  filters?: {
    skills?: string[];
    availability?: string;
    location?: string;
    minExperience?: number;
    acceptsRemote?: boolean;
  },
): Promise<MentorMatch[]> {
  const mentors = await prisma.mentorProfile.findMany({
    where: {
      OR: [
        { bio: { contains: query } },
        { user: { name: { contains: query } } },
        { skills: { some: { skill: { contains: query } } } },
      ],
      ...(filters?.availability && { availability: filters.availability }),
      ...(filters?.acceptsRemote !== undefined && {
        acceptsRemote: filters.acceptsRemote,
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          location: true,
          bio: true,
        },
      },
      skills: true,
    },
  });

  return mentors.map((mentor) => ({
    mentorId: mentor.id,
    score: 0,
    matchedSkills: [],
    matchedInterests: [],
    locationMatch: false,
    availability: mentor.availability,
    yearsExperience: mentor.yearsExperience,
    profile: {
      id: mentor.id,
      bio: mentor.bio,
      availability: mentor.availability,
      yearsExperience: mentor.yearsExperience,
      skills: mentor.skills.map((s: { skill: string }) => s.skill),
      user: mentor.user,
    },
  }));
}
